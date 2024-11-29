import {drizzle, SqliteRemoteDatabase} from 'drizzle-orm/sqlite-proxy';
import {and, desc, eq, SQL, sql} from "drizzle-orm";
import {Observable} from "rxjs";

import migration1 from "../../logic/services/database/migrations/00-setup.sql?raw"

import {fieldsVersions, fields} from "../../logic/services/database/tables/fields/database.ts";
import {contentItems, contentItemsVersions} from "../../logic/services/database/tables/database.ts";
import {contentTypes, contentTypesVersions} from "../../logic/services/database/tables/database.ts";
import {views, viewsVersions} from "../../logic/services/database/tables/views/database.ts";

import {CreateFieldDto, FieldDto, FieldVersionDto, UpdateFieldDto} from "../../logic/services/database/tables/fields/dtos.ts";
import {DataChangeEvent, EventTypes} from "../../logic/services/events/events.ts";
import {DeviceContext, PlatformAdapter} from "./adapter.ts";
import {
	ContentTypeDto, ContentTypeVersionDto,
	CreateContentTypeDto,
	UpdateContentTypeDto
} from "../../logic/services/database/tables/content-types/dtos.ts";
import {
	ContentItemDto, ContentItemVersionDto,
	CreateContentItemDto,
	UpdateContentItemDto
} from "../../logic/services/database/tables/content-items/dtos.ts";
import {CreateViewDto, UpdateViewDto, ViewDto, ViewVersionDto} from "../../logic/services/database/tables/views/dtos.ts";


/**
 * todo: this file and the Database class are insanely big, and contain very repetitive CRUD code.
 * Consider how to refactor to make this more manageable.
 *
 * todo: refactor events (and platform adapter) to be database specific?
 */

const HEADBASE_VERSION = '1.0'
const SCHEMA = {
	fields, fieldsVersions,
	contentTypes, contentTypesVersions,
	contentItems, contentItemsVersions,
	views, viewsVersions,
} as const

export type LiveQuery<DataPromise> = {
		status: "loading"
	} | {
	status: "success",
	data: Awaited<DataPromise>
} | {
	status: 'error',
	error: Error
}

export interface DatabaseConfig {
	context: DeviceContext
	platformAdapter: PlatformAdapter
}

export interface EntitySnapshot {
	[entityId: string]: {
		isDeleted: boolean
		versions: {
			[versionId: string]: boolean
		}
	}
}

export interface GlobalListingOptions {
	filter?: {
		isDeleted?: boolean
	}
}


export class Database {
	readonly #context: DeviceContext;
	readonly #databaseId: string;
	
	readonly #platformAdapter: PlatformAdapter;
	#hasInit: boolean
	
	readonly #database: SqliteRemoteDatabase<typeof SCHEMA>

	constructor(databaseId: string, config: DatabaseConfig) {
		this.#context = config.context
		this.#databaseId = databaseId

		this.#platformAdapter = config.platformAdapter;
		this.#database = drizzle(
			async (sql, params) => {
				return this.#platformAdapter.runSql(this.#databaseId, sql, params)
			},
			(queries) => {
				throw new Error(`[database] Batch queries are not supported yet. Attempted query: ${queries}`)
			},
			{casing: 'snake_case', schema: SCHEMA}
		);
		this.#hasInit = false;

		console.debug(`[database] init complete for '${databaseId}' using contextId '${this.#context.id}'`)
	}

	async #ensureInit() {
		if (!this.#hasInit) {
			await this.#platformAdapter.init()
			await this.#platformAdapter.openDatabase(this.#databaseId)
			
			console.debug(`[database] running migrations for '${this.#databaseId}'`);
			await this.#database.run(sql.raw(migration1))
			this.#hasInit = true
		}
	}

	async close() {
		console.debug(`[database] close started for database '${this.#databaseId}' from context '${this.#context.id}'`)
		await this.#platformAdapter.closeDatabase(this.#databaseId)

		console.debug(`[database] closed database '${this.#databaseId}' from context '${this.#context.id}'`)
	}

	/**
	 * Fields
	 */
	async createField(createDto: CreateFieldDto): Promise<FieldDto> {
		await this.#ensureInit()
		console.debug(`[database] running create field`)

		const entityId = self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.#database
			.insert(fields)
			.values({
				id: entityId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				currentVersionId: versionId
			})

		await this.#database
			.insert(fieldsVersions)
			.values({
				id: versionId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId: entityId,
				previousVersionId: null,
				createdBy: createDto.createdBy,
				type: createDto.type,
				name: createDto.name,
				description: createDto.description,
				icon: createDto.icon,
				settings: 'settings' in createDto ? createDto.settings : null,
			})

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'fields',
				id: entityId,
				action: 'create'
			}
		})

		return this.getField(entityId)
	}

	async updateField(entityId: string, updateDto: UpdateFieldDto): Promise<FieldDto> {
		await this.#ensureInit()
		console.debug(`[database] running update field`)

		const currentEntity = await this.getField(entityId)

		if (currentEntity.type !== updateDto.type) {
			throw new Error('Attempted to change type of field')
		}

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		await this.#database
			.update(fields)
			.set({
				currentVersionId: versionId,
			})
			.where(eq(fields.id, entityId))

		await this.#database
			.insert(fieldsVersions)
			.values({
				id: versionId,
				createdAt: updatedAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId,
				previousVersionId: currentEntity.versionId,
				createdBy: updateDto.createdBy,
				type: updateDto.type,
				name: updateDto.name,
				description: updateDto.description,
				icon: updateDto.icon,
				settings: 'settings' in updateDto ? updateDto.settings : null,
			})

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'fields',
				id: entityId,
				action: 'update'
			}
		})

		// Return the updated field
		// todo: do this via "returning" in version insert?
		return this.getField(entityId)
	}

	async deleteField(entityId: string): Promise<void> {
		await this.#ensureInit()
		console.debug(`[database] running delete field: ${entityId}`)

		// todo: throw error on?

		await this.#database
			.update(fields)
			.set({
				isDeleted: true,
			})
			.where(eq(fields.id, entityId))

		await this.#database
			.delete(fieldsVersions)
			.where(eq(fieldsVersions.entityId, entityId))

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'fields',
				id: entityId,
				action: 'delete'
			}
		})
	}

	async getField(entityId: string): Promise<FieldDto> {
		await this.#ensureInit()
		console.debug(`[database] running get field: ${entityId}`)

		return this.#database
			.select({
				id: fields.id,
				createdAt: fields.createdAt,
				updatedAt: fieldsVersions.createdAt,
				isDeleted: fields.isDeleted,
				versionId: fieldsVersions.id,
				previousVersionId: fieldsVersions.previousVersionId,
				versionCreatedBy: fieldsVersions.createdBy,
				type: fieldsVersions.type,
				name: fieldsVersions.name,
				description: fieldsVersions.description,
				icon: fieldsVersions.icon,
				settings: fieldsVersions.settings,
			})
			.from(fields)
			.innerJoin(fieldsVersions, eq(fields.id, fieldsVersions.entityId))
			.where(
				and(
					eq(fields.id, entityId),
					eq(fields.currentVersionId, fieldsVersions.id)
				)
			)
			.orderBy(desc(fieldsVersions.createdAt)) as unknown as FieldDto;
	}

	async getFields(options?: GlobalListingOptions): Promise<FieldDto[]> {
		await this.#ensureInit()
		console.debug(`[database] running get fields`)

		const filters: SQL[] = [
			eq(fields.currentVersionId, fieldsVersions.id)
		]
		if (typeof options?.filter?.isDeleted === 'boolean') {
			filters.push(
				eq(fields.isDeleted, options?.filter.isDeleted)
			)
		}

		const order: SQL = desc(fieldsVersions.createdAt)

		return this.#database
			.select({
				id: fields.id,
				createdAt: fields.createdAt,
				updatedAt: fieldsVersions.createdAt,
				isDeleted: fields.isDeleted,
				versionId: fieldsVersions.id,
				previousVersionId: fieldsVersions.previousVersionId,
				versionCreatedBy: fieldsVersions.createdBy,
				type: fieldsVersions.type,
				name: fieldsVersions.name,
				description: fieldsVersions.description,
				icon: fieldsVersions.icon,
				settings: fieldsVersions.settings,
			})
			.from(fields)
			.innerJoin(fieldsVersions, eq(fields.id, fieldsVersions.entityId))
			.where(and(...filters))
			.orderBy(order) as unknown as FieldDto[];
	}

	async getFieldsSnapshot(): Promise<EntitySnapshot> {
		const entities = await this.#database
			.select({
				id: fields.id,
				isDeleted: fields.isDeleted,
			})
			.from(fields)

		const versions = await this.#database
			.select({
				id: fieldsVersions.id,
				entityId: fieldsVersions.entityId,
				isDeleted: fieldsVersions.isDeleted,
			})
			.from(fieldsVersions)

		const snapshot: EntitySnapshot = {}

		for (const entity of entities) {
			snapshot[entity.id] = {isDeleted: entity.isDeleted, versions: {}}
		}
		for (const version of versions) {
			if (snapshot[version.entityId]) {
				snapshot[version.entityId].versions[version.id] = version.isDeleted
			}
			else {
				// todo: may need to handle a different way?
				// We can't throw an error as this may occur if in the middle of a sync etc
				console.error('Found version with no matching entity')
			}
		}

		return snapshot
	}

	liveGetField(entityId: string) {
		return new Observable<LiveQuery<ReturnType<Database['getField']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getField(entityId);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.#databaseId &&
					e.detail.data.tableKey === 'fields' &&
					e.detail.data.id === entityId
				) {
					console.debug(`[observableGet] Received event that requires re-query`)
					runQuery()
				}
			}

			this.#platformAdapter.subscribeEvent(EventTypes.DATA_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	liveGetFields(options?: GlobalListingOptions) {
		return new Observable<LiveQuery<ReturnType<Database['getFields']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getFields(options);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.#databaseId &&
					e.detail.data.tableKey === 'fields'
				) {
					console.debug(`[observableGet] Received event that requires re-query`)
					runQuery()
				}
			}

			this.#platformAdapter.subscribeEvent(EventTypes.DATA_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	async getFieldVersion(versionId: string) {
		await this.#ensureInit()
		console.debug(`[database] running getFieldVersion: ${versionId}`)

		return this.#database
			.select({
				id: fieldsVersions.id,
				createdAt: fieldsVersions.createdAt,
				isDeleted: fieldsVersions.isDeleted,
				entityId: fieldsVersions.id,
				previousVersionId: fieldsVersions.previousVersionId,
				versionCreatedBy: fieldsVersions.createdBy,
				type: fieldsVersions.type,
				name: fieldsVersions.name,
				description: fieldsVersions.description,
				icon: fieldsVersions.icon,
				settings: fieldsVersions.settings,
			})
			.from(fieldsVersions)
			.where(eq(fieldsVersions.id, versionId)) as unknown as FieldVersionDto;
	}

	async getFieldVersions(entityId: string) {
		await this.#ensureInit()
		console.debug(`[database] running getFieldVersions: ${entityId}`)

		return this.#database
			.select({
				id: fieldsVersions.id,
				createdAt: fieldsVersions.createdAt,
				isDeleted: fieldsVersions.isDeleted,
				entityId: fieldsVersions.id,
				previousVersionId: fieldsVersions.previousVersionId,
				versionCreatedBy: fieldsVersions.createdBy,
				type: fieldsVersions.type,
				name: fieldsVersions.name,
				description: fieldsVersions.description,
				icon: fieldsVersions.icon,
				settings: fieldsVersions.settings,
			})
			.from(fieldsVersions)
			.where(eq(fieldsVersions.entityId, entityId))
			.orderBy(desc(fieldsVersions.createdAt)) as unknown as FieldVersionDto[];
	}

	async deleteFieldVersion(versionId: string): Promise<void> {
		const version = await this.#database
			.select({id: fieldsVersions.id, entityId: fieldsVersions.entityId})
			.from(fieldsVersions)
			.where(eq(fieldsVersions.id, versionId))
		if (!version) {
			throw new Error('Version not found')
		}

		const currentEntity = await this.#database
			.select({id: fields.id, currentVersionId: fields.currentVersionId})
			.from(fields)
			.where(eq(fields.id, version[0].entityId))
		if (!currentEntity) {
			throw new Error('Entity for version not found')
		}

		if (currentEntity[0].currentVersionId === versionId) {
			throw new Error('Attempted to delete current version')
		}

		await this.#database
			.delete(fieldsVersions)
			.where(eq(fieldsVersions.id, versionId))

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'fields',
				id: currentEntity[0].id,
				action: 'delete-version'
			}
		})
	}

	liveGetFieldVersions(entityId: string) {
		return new Observable<LiveQuery<ReturnType<Database['getFieldVersions']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getFieldVersions(entityId);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.#databaseId &&
					e.detail.data.tableKey === 'fields' &&
					e.detail.data.id === entityId
				) {
					console.debug(`[observableGet] Received event that requires re-query`)
					runQuery()
				}
			}

			this.#platformAdapter.subscribeEvent(EventTypes.DATA_CHANGE, handleEvent)

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}


	/**
	 * Content types
	 */
	async createContentType(createDto: CreateContentTypeDto): Promise<ContentTypeDto> {
		await this.#ensureInit()

		const entityId = self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.#database
			.insert(contentTypes)
			.values({
				id: entityId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				currentVersionId: versionId
			})

		await this.#database
			.insert(contentTypesVersions)
			.values({
				id: versionId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId: entityId,
				previousVersionId: null,
				createdBy: createDto.createdBy,
				// Custom data
				name: createDto.name,
				icon: createDto.icon,
				colour: createDto.colour,
				description: createDto.description,
				templateName: createDto.templateName,
				templateFields: createDto.templateFields,
			})

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'content_types',
				id: entityId,
				action: 'create'
			}
		})

		return this.getContentType(entityId)
	}

	async updateContentType(entityId: string, updateDto: UpdateContentTypeDto): Promise<ContentTypeDto> {
		await this.#ensureInit()

		const currentEntity = await this.getContentType(entityId)

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		await this.#database
			.update(contentTypes)
			.set({
				currentVersionId: versionId,
			})
			.where(eq(contentTypes.id, entityId))

		await this.#database
			.insert(contentTypesVersions)
			.values({
				id: versionId,
				createdAt: updatedAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId,
				previousVersionId: currentEntity.versionId,
				createdBy: updateDto.createdBy,
				// Custom fields
				name: updateDto.name,
				icon: updateDto.icon,
				colour: updateDto.colour,
				description: updateDto.description,
				templateName: updateDto.templateName,
				templateFields: updateDto.templateFields,
			})

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'content_types',
				id: entityId,
				action: 'update'
			}
		})

		// Return the updated field
		// todo: do this via "returning" in version insert?
		return this.getContentType(entityId)
	}

	async deleteContentType(entityId: string): Promise<void> {
		await this.#ensureInit()
		console.debug(`[database] running delete field: ${entityId}`)

		// todo: throw error on?

		await this.#database
			.update(contentTypes)
			.set({
				isDeleted: true,
			})
			.where(eq(contentTypes.id, entityId))

		// todo: should retain latest version just in case?
		await this.#database
			.delete(contentTypesVersions)
			.where(eq(contentTypesVersions.entityId, entityId))

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'content_types',
				id: entityId,
				action: 'delete'
			}
		})
	}

	async getContentType(entityId: string): Promise<ContentTypeDto> {
		await this.#ensureInit()
		return this.#database
			.select({
				id: contentTypes.id,
				createdAt: contentTypes.createdAt,
				updatedAt: contentTypesVersions.createdAt,
				isDeleted: contentTypes.isDeleted,
				versionId: contentTypesVersions.id,
				previousVersionId: contentTypesVersions.previousVersionId,
				versionCreatedBy: contentTypesVersions.createdBy,
				// Custom fields
				name: contentTypesVersions.name,
				icon: contentTypesVersions.icon,
				colour: contentTypesVersions.colour,
				description: contentTypesVersions.description,
				templateName: contentTypesVersions.templateName,
				templateFields: contentTypesVersions.templateFields,
			})
			.from(contentTypes)
			.innerJoin(contentTypesVersions, eq(contentTypes.id, contentTypesVersions.entityId))
			.where(
				and(
					eq(contentTypes.id, entityId),
					eq(contentTypes.currentVersionId, contentTypesVersions.id)
				)
			)
			.orderBy(desc(contentTypesVersions.createdAt)) as unknown as ContentTypeDto;
	}

	async getContentTypes(options?: GlobalListingOptions): Promise<ContentTypeDto[]> {
		await this.#ensureInit()

		const filters: SQL[] = [
			eq(contentTypes.currentVersionId, contentTypesVersions.id)
		]
		if (typeof options?.filter?.isDeleted === 'boolean') {
			filters.push(
				eq(contentTypes.isDeleted, options?.filter.isDeleted)
			)
		}

		const order: SQL = desc(contentTypesVersions.createdAt)

		return this.#database
			.select({
				id: contentTypes.id,
				createdAt: contentTypes.createdAt,
				updatedAt: contentTypesVersions.createdAt,
				isDeleted: contentTypes.isDeleted,
				versionId: contentTypesVersions.id,
				previousVersionId: contentTypesVersions.previousVersionId,
				versionCreatedBy: contentTypesVersions.createdBy,
				// Custom fields
				name: contentTypesVersions.name,
				icon: contentTypesVersions.icon,
				colour: contentTypesVersions.colour,
				description: contentTypesVersions.description,
				templateName: contentTypesVersions.templateName,
				templateFields: contentTypesVersions.templateFields,
			})
			.from(contentTypes)
			.innerJoin(contentTypesVersions, eq(contentTypes.id, contentTypesVersions.entityId))
			.where(and(...filters))
			.orderBy(order) as unknown as ContentTypeDto[];
	}

	async getContentTypesSnapshot(): Promise<EntitySnapshot> {
		const entities = await this.#database
			.select({
				id: contentTypes.id,
				isDeleted: contentTypes.isDeleted,
			})
			.from(contentTypes)

		const versions = await this.#database
			.select({
				id: contentTypesVersions.id,
				entityId: contentTypesVersions.entityId,
				isDeleted: contentTypesVersions.isDeleted,
			})
			.from(contentTypesVersions)

		const snapshot: EntitySnapshot = {}

		for (const entity of entities) {
			snapshot[entity.id] = {isDeleted: entity.isDeleted, versions: {}}
		}
		for (const version of versions) {
			if (snapshot[version.entityId]) {
				snapshot[version.entityId].versions[version.id] = version.isDeleted
			}
			else {
				// todo: may need to handle a different way?
				// We can't throw an error as this may occur if in the middle of a sync etc
				console.error('Found version with no matching entity')
			}
		}

		return snapshot
	}

	liveGetContentType(entityId: string) {
		return new Observable<LiveQuery<ReturnType<Database['getContentType']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getContentType(entityId);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.#databaseId &&
					e.detail.data.tableKey === 'content_types' &&
					e.detail.data.id === entityId
				) {
					runQuery()
				}
			}

			this.#platformAdapter.subscribeEvent(EventTypes.DATA_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	liveGetContentTypes(options?: GlobalListingOptions) {
		return new Observable<LiveQuery<ReturnType<Database['getContentTypes']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getContentTypes(options);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.#databaseId &&
					e.detail.data.tableKey === 'content_types'
				) {
					runQuery()
				}
			}

			this.#platformAdapter.subscribeEvent(EventTypes.DATA_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	async getContentTypeVersion(versionId: string) {
		await this.#ensureInit()

		return this.#database
			.select({
				id: contentTypesVersions.id,
				createdAt: contentTypesVersions.createdAt,
				isDeleted: contentTypesVersions.isDeleted,
				entityId: contentTypesVersions.id,
				previousVersionId: contentTypesVersions.previousVersionId,
				versionCreatedBy: contentTypesVersions.createdBy,
				// Custom fields
				name: contentTypesVersions.name,
				icon: contentTypesVersions.icon,
				colour: contentTypesVersions.colour,
				description: contentTypesVersions.description,
				templateName: contentTypesVersions.templateName,
				templateFields: contentTypesVersions.templateFields,
			})
			.from(contentTypesVersions)
			.where(eq(contentTypesVersions.id, versionId)) as unknown as ContentTypeVersionDto;
	}

	async getContentTypeVersions(entityId: string) {
		await this.#ensureInit()

		return this.#database
			.select({
				id: contentTypesVersions.id,
				createdAt: contentTypesVersions.createdAt,
				isDeleted: contentTypesVersions.isDeleted,
				entityId: contentTypesVersions.id,
				previousVersionId: contentTypesVersions.previousVersionId,
				versionCreatedBy: contentTypesVersions.createdBy,
				// Custom fields
				name: contentTypesVersions.name,
				icon: contentTypesVersions.icon,
				colour: contentTypesVersions.colour,
				description: contentTypesVersions.description,
				templateName: contentTypesVersions.templateName,
				templateFields: contentTypesVersions.templateFields,
			})
			.from(contentTypesVersions)
			.where(eq(contentTypesVersions.entityId, entityId))
			.orderBy(desc(contentTypesVersions.createdAt)) as unknown as ContentTypeVersionDto[];
	}

	async deleteContentTypeVersion(versionId: string): Promise<void> {
		const version = await this.#database
			.select({id: contentTypesVersions.id, entityId: contentTypesVersions.entityId})
			.from(contentTypesVersions)
			.where(eq(contentTypesVersions.id, versionId))
		if (!version) {
			throw new Error('Version not found')
		}

		const currentEntity = await this.#database
			.select({id: contentTypes.id, currentVersionId: contentTypes.currentVersionId})
			.from(contentTypes)
			.where(eq(contentTypes.id, version[0].entityId))
		if (!currentEntity) {
			throw new Error('Entity for version not found')
		}

		if (currentEntity[0].currentVersionId === versionId) {
			throw new Error('Attempted to delete current version')
		}

		await this.#database
			.delete(fieldsVersions)
			.where(eq(fieldsVersions.id, versionId))

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'fields',
				id: currentEntity[0].id,
				action: 'delete-version'
			}
		})
	}

	liveGetContentTypeVersions(entityId: string) {
		return new Observable<LiveQuery<ReturnType<Database['getContentTypeVersions']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getContentTypeVersions(entityId);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.#databaseId &&
					e.detail.data.tableKey === 'content_types' &&
					e.detail.data.id === entityId
				) {
					runQuery()
				}
			}

			this.#platformAdapter.subscribeEvent(EventTypes.DATA_CHANGE, handleEvent)

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}


	/**
	 * Content items
	 */
	async createContentItem(createDto: CreateContentItemDto): Promise<ContentItemDto> {
		await this.#ensureInit()

		const entityId = self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.#database
			.insert(contentItems)
			.values({
				id: entityId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				currentVersionId: versionId
			})

		await this.#database
			.insert(contentItemsVersions)
			.values({
				id: versionId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId: entityId,
				previousVersionId: null,
				createdBy: createDto.createdBy,
				// Custom data
				type: createDto.type,
				name: createDto.name,
				isFavourite: createDto.isFavourite,
				fields: createDto.fields,
			})

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'content_items',
				id: entityId,
				action: 'create'
			}
		})

		return this.getContentItem(entityId)
	}

	async updateContentItem(entityId: string, updateDto: UpdateContentItemDto): Promise<ContentItemDto> {
		await this.#ensureInit()

		const currentEntity = await this.getContentItem(entityId)

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		await this.#database
			.update(contentItems)
			.set({
				currentVersionId: versionId,
			})
			.where(eq(contentItems.id, entityId))

		await this.#database
			.insert(contentItemsVersions)
			.values({
				id: versionId,
				createdAt: updatedAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId,
				previousVersionId: currentEntity.versionId,
				createdBy: updateDto.createdBy,
				// Custom fields
				type: updateDto.type,
				name: updateDto.name,
				isFavourite: updateDto.isFavourite,
				fields: updateDto.fields,
			})

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'content_items',
				id: entityId,
				action: 'update'
			}
		})

		// Return the updated field
		// todo: do this via "returning" in version insert?
		return this.getContentItem(entityId)
	}

	async deleteContentItem(entityId: string): Promise<void> {
		await this.#ensureInit()
		console.debug(`[database] running delete field: ${entityId}`)

		// todo: throw error on?

		await this.#database
			.update(contentItems)
			.set({
				isDeleted: true,
			})
			.where(eq(contentItems.id, entityId))

		// todo: should retain latest version just in case?
		await this.#database
			.delete(contentItemsVersions)
			.where(eq(contentItemsVersions.entityId, entityId))

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'content_items',
				id: entityId,
				action: 'delete'
			}
		})
	}

	async getContentItem(entityId: string): Promise<ContentItemDto> {
		await this.#ensureInit()
		return this.#database
			.select({
				id: contentItems.id,
				createdAt: contentItems.createdAt,
				updatedAt: contentItemsVersions.createdAt,
				isDeleted: contentItems.isDeleted,
				versionId: contentItemsVersions.id,
				previousVersionId: contentItemsVersions.previousVersionId,
				versionCreatedBy: contentItemsVersions.createdBy,
				// Custom fields
				type: contentItemsVersions.type,
				name: contentItemsVersions.name,
				isFavourite: contentItemsVersions.isFavourite,
				fields: contentItemsVersions.fields,
			})
			.from(contentItems)
			.innerJoin(contentItemsVersions, eq(contentItems.id, contentItemsVersions.entityId))
			.where(
				and(
					eq(contentItems.id, entityId),
					eq(contentItems.currentVersionId, contentItemsVersions.id)
				)
			)
			.orderBy(desc(contentItemsVersions.createdAt)) as unknown as ContentItemDto;
	}

	async getContentItems(options?: GlobalListingOptions): Promise<ContentItemDto[]> {
		await this.#ensureInit()

		const filters: SQL[] = [
			eq(contentItems.currentVersionId, contentItemsVersions.id)
		]
		if (typeof options?.filter?.isDeleted === 'boolean') {
			filters.push(
				eq(contentItems.isDeleted, options?.filter.isDeleted)
			)
		}

		const order: SQL = desc(contentItemsVersions.createdAt)

		return this.#database
			.select({
				id: contentItems.id,
				createdAt: contentItems.createdAt,
				updatedAt: contentItemsVersions.createdAt,
				isDeleted: contentItems.isDeleted,
				versionId: contentItemsVersions.id,
				previousVersionId: contentItemsVersions.previousVersionId,
				versionCreatedBy: contentItemsVersions.createdBy,
				// Custom fields
				type: contentItemsVersions.type,
				name: contentItemsVersions.name,
				isFavourite: contentItemsVersions.isFavourite,
				fields: contentItemsVersions.fields,
			})
			.from(contentItems)
			.innerJoin(contentItemsVersions, eq(contentItems.id, contentItemsVersions.entityId))
			.where(and(...filters))
			.orderBy(order) as unknown as ContentItemDto[];
	}

	async getContentItemsSnapshot(): Promise<EntitySnapshot> {
		const entities = await this.#database
			.select({
				id: contentItems.id,
				isDeleted: contentItems.isDeleted,
			})
			.from(contentItems)

		const versions = await this.#database
			.select({
				id: contentItemsVersions.id,
				entityId: contentItemsVersions.entityId,
				isDeleted: contentItemsVersions.isDeleted,
			})
			.from(contentItemsVersions)

		const snapshot: EntitySnapshot = {}

		for (const entity of entities) {
			snapshot[entity.id] = {isDeleted: entity.isDeleted, versions: {}}
		}
		for (const version of versions) {
			if (snapshot[version.entityId]) {
				snapshot[version.entityId].versions[version.id] = version.isDeleted
			}
			else {
				// todo: may need to handle a different way?
				// We can't throw an error as this may occur if in the middle of a sync etc
				console.error('Found version with no matching entity')
			}
		}

		return snapshot
	}

	liveGetContentItem(entityId: string) {
		return new Observable<LiveQuery<ReturnType<Database['getContentItem']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getContentItem(entityId);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.#databaseId &&
					e.detail.data.tableKey === 'content_items' &&
					e.detail.data.id === entityId
				) {
					runQuery()
				}
			}

			this.#platformAdapter.subscribeEvent(EventTypes.DATA_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	liveGetContentItems(options?: GlobalListingOptions) {
		return new Observable<LiveQuery<ReturnType<Database['getContentItems']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getContentItems(options);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.#databaseId &&
					e.detail.data.tableKey === 'content_items'
				) {
					runQuery()
				}
			}

			this.#platformAdapter.subscribeEvent(EventTypes.DATA_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	async getContentItemVersion(versionId: string) {
		await this.#ensureInit()

		return this.#database
			.select({
				id: contentItemsVersions.id,
				createdAt: contentItemsVersions.createdAt,
				isDeleted: contentItemsVersions.isDeleted,
				entityId: contentItemsVersions.id,
				previousVersionId: contentItemsVersions.previousVersionId,
				versionCreatedBy: contentItemsVersions.createdBy,
				// Custom fields
				type: contentItemsVersions.type,
				name: contentItemsVersions.name,
				isFavourite: contentItemsVersions.isFavourite,
				fields: contentItemsVersions.fields,
			})
			.from(contentItemsVersions)
			.where(eq(contentItemsVersions.id, versionId)) as unknown as ContentItemVersionDto;
	}

	async getContentItemVersions(entityId: string) {
		await this.#ensureInit()

		return this.#database
			.select({
				id: contentItemsVersions.id,
				createdAt: contentItemsVersions.createdAt,
				isDeleted: contentItemsVersions.isDeleted,
				entityId: contentItemsVersions.id,
				previousVersionId: contentItemsVersions.previousVersionId,
				versionCreatedBy: contentItemsVersions.createdBy,
				// Custom fields
				type: contentItemsVersions.type,
				name: contentItemsVersions.name,
				isFavourite: contentItemsVersions.isFavourite,
				fields: contentItemsVersions.fields,
			})
			.from(contentItemsVersions)
			.where(eq(contentItemsVersions.entityId, entityId))
			.orderBy(desc(contentItemsVersions.createdAt)) as unknown as ContentItemVersionDto[];
	}

	async deleteContentItemVersion(versionId: string): Promise<void> {
		const version = await this.#database
			.select({id: contentItemsVersions.id, entityId: contentItemsVersions.entityId})
			.from(contentItemsVersions)
			.where(eq(contentItemsVersions.id, versionId))
		if (!version) {
			throw new Error('Version not found')
		}

		const currentEntity = await this.#database
			.select({id: contentItems.id, currentVersionId: contentItems.currentVersionId})
			.from(contentItems)
			.where(eq(contentItems.id, version[0].entityId))
		if (!currentEntity) {
			throw new Error('Entity for version not found')
		}

		if (currentEntity[0].currentVersionId === versionId) {
			throw new Error('Attempted to delete current version')
		}

		await this.#database
			.delete(contentItemsVersions)
			.where(eq(contentItemsVersions.id, versionId))

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'content_items',
				id: currentEntity[0].id,
				action: 'delete-version'
			}
		})
	}

	liveGetContentItemVersions(entityId: string) {
		return new Observable<LiveQuery<ReturnType<Database['getContentItemVersions']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getContentItemVersions(entityId);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.#databaseId &&
					e.detail.data.tableKey === 'content_items' &&
					e.detail.data.id === entityId
				) {
					runQuery()
				}
			}

			this.#platformAdapter.subscribeEvent(EventTypes.DATA_CHANGE, handleEvent)

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	/**
	 * Views
	 */
	async createView(createDto: CreateViewDto): Promise<ViewDto> {
		await this.#ensureInit()

		const entityId = self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.#database
			.insert(views)
			.values({
				id: entityId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				currentVersionId: versionId
			})

		await this.#database
			.insert(viewsVersions)
			.values({
				id: versionId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId: entityId,
				previousVersionId: null,
				createdBy: createDto.createdBy,
				// Custom data
				type: createDto.type,
				name: createDto.name,
				icon: createDto.icon,
				colour: createDto.colour,
				description: createDto.description,
				isFavourite: createDto.isFavourite,
				settings: createDto.settings,
			})

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'views',
				id: entityId,
				action: 'create'
			}
		})

		return this.getView(entityId)
	}

	async updateView(entityId: string, updateDto: UpdateViewDto): Promise<ViewDto> {
		await this.#ensureInit()

		const currentEntity = await this.getView(entityId)

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		await this.#database
			.update(views)
			.set({
				currentVersionId: versionId,
			})
			.where(eq(views.id, entityId))

		await this.#database
			.insert(viewsVersions)
			.values({
				id: versionId,
				createdAt: updatedAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId,
				previousVersionId: currentEntity.versionId,
				createdBy: updateDto.createdBy,
				// Custom fields
				type: updateDto.type,
				name: updateDto.name,
				icon: updateDto.icon,
				colour: updateDto.colour,
				description: updateDto.description,
				isFavourite: updateDto.isFavourite,
				settings: updateDto.settings,
			})

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'views',
				id: entityId,
				action: 'update'
			}
		})

		// Return the updated field
		// todo: do this via "returning" in version insert?
		return this.getView(entityId)
	}

	async deleteView(entityId: string): Promise<void> {
		await this.#ensureInit()
		// todo: throw error on not existing?

		await this.#database
			.update(views)
			.set({
				isDeleted: true,
			})
			.where(eq(views.id, entityId))

		// todo: should retain latest version just in case?
		await this.#database
			.delete(viewsVersions)
			.where(eq(viewsVersions.entityId, entityId))

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'views',
				id: entityId,
				action: 'delete'
			}
		})
	}

	async getView(entityId: string): Promise<ViewDto> {
		await this.#ensureInit()
		return this.#database
			.select({
				id: views.id,
				createdAt: views.createdAt,
				updatedAt: viewsVersions.createdAt,
				isDeleted: views.isDeleted,
				versionId: viewsVersions.id,
				previousVersionId: viewsVersions.previousVersionId,
				versionCreatedBy: viewsVersions.createdBy,
				// Custom fields
				type: viewsVersions.type,
				name: viewsVersions.name,
				icon: viewsVersions.icon,
				colour: viewsVersions.colour,
				description: viewsVersions.description,
				isFavourite: viewsVersions.isFavourite,
				settings: viewsVersions.settings,
			})
			.from(views)
			.innerJoin(viewsVersions, eq(views.id, viewsVersions.entityId))
			.where(
				and(
					eq(views.id, entityId),
					eq(views.currentVersionId, viewsVersions.id)
				)
			)
			.orderBy(desc(viewsVersions.createdAt)) as unknown as ViewDto;
	}

	async getViews(options?: GlobalListingOptions): Promise<ViewDto[]> {
		await this.#ensureInit()

		const filters: SQL[] = [
			eq(views.currentVersionId, viewsVersions.id)
		]
		if (typeof options?.filter?.isDeleted === 'boolean') {
			filters.push(
				eq(views.isDeleted, options?.filter.isDeleted)
			)
		}

		const order: SQL = desc(contentItemsVersions.createdAt)

		return this.#database
			.select({
				id: views.id,
				createdAt: views.createdAt,
				updatedAt: viewsVersions.createdAt,
				isDeleted: views.isDeleted,
				versionId: viewsVersions.id,
				previousVersionId: viewsVersions.previousVersionId,
				versionCreatedBy: viewsVersions.createdBy,
				// Custom fields
				type: viewsVersions.type,
				name: viewsVersions.name,
				icon: viewsVersions.icon,
				colour: viewsVersions.colour,
				description: viewsVersions.description,
				isFavourite: viewsVersions.isFavourite,
				settings: viewsVersions.settings,
			})
			.from(views)
			.innerJoin(viewsVersions, eq(views.id, viewsVersions.entityId))
			.where(and(...filters))
			.orderBy(order) as unknown as ViewDto[];
	}

	async getViewsSnapshot(): Promise<EntitySnapshot> {
		const entities = await this.#database
			.select({
				id: views.id,
				isDeleted: views.isDeleted,
			})
			.from(views)

		const versions = await this.#database
			.select({
				id: viewsVersions.id,
				entityId: viewsVersions.entityId,
				isDeleted: viewsVersions.isDeleted,
			})
			.from(viewsVersions)

		const snapshot: EntitySnapshot = {}

		for (const entity of entities) {
			snapshot[entity.id] = {isDeleted: entity.isDeleted, versions: {}}
		}
		for (const version of versions) {
			if (snapshot[version.entityId]) {
				snapshot[version.entityId].versions[version.id] = version.isDeleted
			}
			else {
				// todo: may need to handle a different way?
				// We can't throw an error as this may occur if in the middle of a sync etc
				console.error('Found version with no matching entity')
			}
		}

		return snapshot
	}

	liveGetView(entityId: string) {
		return new Observable<LiveQuery<ReturnType<Database['getView']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getView(entityId);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.#databaseId &&
					e.detail.data.tableKey === 'views' &&
					e.detail.data.id === entityId
				) {
					runQuery()
				}
			}

			this.#platformAdapter.subscribeEvent(EventTypes.DATA_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	liveGetViews(options?: GlobalListingOptions) {
		return new Observable<LiveQuery<ReturnType<Database['getViews']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getViews(options);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.#databaseId &&
					e.detail.data.tableKey === 'views'
				) {
					runQuery()
				}
			}

			this.#platformAdapter.subscribeEvent(EventTypes.DATA_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	async getViewVersion(versionId: string) {
		await this.#ensureInit()

		return this.#database
			.select({
				id: viewsVersions.id,
				createdAt: viewsVersions.createdAt,
				isDeleted: viewsVersions.isDeleted,
				entityId: viewsVersions.id,
				previousVersionId: viewsVersions.previousVersionId,
				versionCreatedBy: viewsVersions.createdBy,
				// Custom fields
				type: viewsVersions.type,
				name: viewsVersions.name,
				icon: viewsVersions.icon,
				colour: viewsVersions.colour,
				description: viewsVersions.description,
				isFavourite: viewsVersions.isFavourite,
				settings: viewsVersions.settings,
			})
			.from(viewsVersions)
			.where(eq(viewsVersions.id, versionId)) as unknown as ViewVersionDto;
	}

	async getViewVersions(entityId: string) {
		await this.#ensureInit()

		return this.#database
			.select({
				id: viewsVersions.id,
				createdAt: viewsVersions.createdAt,
				isDeleted: viewsVersions.isDeleted,
				entityId: viewsVersions.id,
				previousVersionId: viewsVersions.previousVersionId,
				versionCreatedBy: viewsVersions.createdBy,
				// Custom fields
				type: viewsVersions.type,
				name: viewsVersions.name,
				icon: viewsVersions.icon,
				colour: viewsVersions.colour,
				description: viewsVersions.description,
				isFavourite: viewsVersions.isFavourite,
				settings: viewsVersions.settings,
			})
			.from(viewsVersions)
			.where(eq(viewsVersions.entityId, entityId))
			.orderBy(desc(viewsVersions.createdAt)) as unknown as ViewVersionDto[];
	}

	async deleteViewVersion(versionId: string): Promise<void> {
		const version = await this.#database
			.select({id: viewsVersions.id, entityId: viewsVersions.entityId})
			.from(viewsVersions)
			.where(eq(viewsVersions.id, versionId))
		if (!version) {
			throw new Error('Version not found')
		}

		const currentEntity = await this.#database
			.select({id: views.id, currentVersionId: views.currentVersionId})
			.from(views)
			.where(eq(views.id, version[0].entityId))
		if (!currentEntity) {
			throw new Error('Entity for version not found')
		}

		if (currentEntity[0].currentVersionId === versionId) {
			throw new Error('Attempted to delete current version')
		}

		await this.#database
			.delete(viewsVersions)
			.where(eq(viewsVersions.id, versionId))

		this.#platformAdapter.dispatchEvent(EventTypes.DATA_CHANGE, {
			context: this.#context,
			data: {
				databaseId: this.#databaseId,
				tableKey: 'views',
				id: currentEntity[0].id,
				action: 'delete-version'
			}
		})
	}

	liveGetViewVersions(entityId: string) {
		return new Observable<LiveQuery<ReturnType<Database['getViewVersions']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getViewVersions(entityId);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.#databaseId &&
					e.detail.data.tableKey === 'views' &&
					e.detail.data.id === entityId
				) {
					runQuery()
				}
			}

			this.#platformAdapter.subscribeEvent(EventTypes.DATA_CHANGE, handleEvent)

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}
}
