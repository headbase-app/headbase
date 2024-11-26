import {drizzle, SqliteRemoteDatabase} from 'drizzle-orm/sqlite-proxy';
import {and, desc, eq, SQL, sql} from "drizzle-orm";
import {Observable} from "rxjs";

import migration1 from "./migrations/00-setup.sql?raw"
import {WorkerAdapter} from "./adapters/worker-adapter.ts";

import {fieldsVersions, fields} from "./schema/fields/database.ts";
import {contentItems, contentItemsVersions} from "./schema/content-items/database.ts";
import {contentTypes, contentTypesVersions} from "./schema/content-types/database.ts";
import {views, viewsVersions} from "./schema/views/database.ts";

import {CreateFieldDto, FieldDto, FieldVersionDto, UpdateFieldDto} from "./schema/fields/dtos.ts";
import {ContentTypeDto, CreateContentTypeDto, UpdateContentTypeDto} from "./schema/content-types/dtos.ts";
import {EventsService} from "../services/events/events.service.ts";
import {AnyHeadbaseEvent, EventTypes, HeadbaseEvent} from "../services/events/events.ts";

/**
 * todo: this file and the Database class are insanely big, and contain very repetitive CRUD code.
 * Consider how to refactor to make this more manageable.
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
	databaseAdapter: typeof WorkerAdapter
	eventService: EventsService
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
	readonly #contextId: string;

	readonly #databaseId: string;
	readonly #databaseAdapter: WorkerAdapter;
	readonly #database: SqliteRemoteDatabase<typeof SCHEMA>
	#hasInit: boolean

	readonly #eventService: EventsService

	constructor(databaseId: string, config: DatabaseConfig) {
		this.#contextId = self.crypto.randomUUID()

		this.#databaseId = databaseId;
		this.#databaseAdapter = new config.databaseAdapter({contextId: this.#contextId, databaseId: this.#databaseId})
		this.#database = drizzle(
			async (sql, params) => {
				return this.#databaseAdapter.run(sql, params)
			},
			(queries) => {
				throw new Error(`[database] Batch queries are not supported yet. Attempted query: ${queries}`)
			},
			{casing: 'snake_case', schema: SCHEMA}
		);
		this.#hasInit = false;

		this.#eventService = config.eventService
		console.debug(`[database] init complete for '${databaseId}' using contextId '${this.#contextId}'`)
	}

	async #ensureInit() {
		if (!this.#hasInit) {
			await this.#databaseAdapter.init()
			console.debug(`[database] running migrations for '${this.#databaseId}'`);
			await this.#database.run(sql.raw(migration1))
			this.#hasInit = true
		}
	}

	async close() {
		console.debug(`[database] close started for database '${this.#databaseId}' from context '${this.#contextId}'`)
		await this.#databaseAdapter.close()

		console.debug(`[database] closed database '${this.#databaseId}' from context '${this.#contextId}'`)
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

		this.#eventService.dispatch(EventTypes.DATA_CHANGE, {databaseId: this.#databaseId, tableKey: 'fields', id: entityId, action: 'create'})

		return this.getField(entityId)
	}

	async updateField(id: string, updateDto: UpdateFieldDto): Promise<FieldDto> {
		await this.#ensureInit()
		console.debug(`[database] running update field`)

		const currentField = await this.getField(id)

		if (currentField.type !== updateDto.type) {
			throw new Error('Attempted to change type of field')
		}

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		await this.#database
			.update(fields)
			.set({
				currentVersionId: versionId,
			})
			.where(eq(fields.id, id))

		await this.#database
			.insert(fieldsVersions)
			.values({
				id: versionId,
				createdAt: updatedAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId: id,
				previousVersionId: currentField.versionId,
				createdBy: updateDto.createdBy,
				type: updateDto.type,
				name: updateDto.name,
				description: updateDto.description,
				icon: updateDto.icon,
				settings: 'settings' in updateDto ? updateDto.settings : null,
			})

		this.#eventService.dispatch(EventTypes.DATA_CHANGE, {databaseId: this.#databaseId, tableKey: 'fields', id: id, action: 'update'})

		// Return the updated field
		// todo: do this via "returning" in version insert?
		return this.getField(id)
	}

	async deleteField(id: string): Promise<void> {
		await this.#ensureInit()
		console.debug(`[database] running delete field: ${id}`)

		// todo: throw error on?

		await this.#database
			.update(fields)
			.set({
				isDeleted: true,
			})
			.where(eq(fields.id, id))

		await this.#database
			.delete(fieldsVersions)
			.where(eq(fieldsVersions.entityId, id))

		this.#eventService.dispatch(EventTypes.DATA_CHANGE, {databaseId: this.#databaseId, tableKey: 'fields', id: id, action: 'delete'})
	}

	async getField(id: string): Promise<FieldDto> {
		await this.#ensureInit()
		console.debug(`[database] running get field: ${id}`)

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
					eq(fields.id, id),
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

	liveGetField(id: string) {
		return new Observable<LiveQuery<ReturnType<Database['getField']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const makeQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getField(id);
				subscriber.next({status: 'success', data: results})
			}

			const handleEvent = (e: AnyHeadbaseEvent) => {
				// Discard if tableKey or ID doesn't match, as the data won't have changed.
				if (e.detail.id === id && e.detail.data.id === id) {
					Logger.debug(`[observableGet] Received event that requires re-query`)
					runQuery()
				}
			}

			this.#events.addEventListener('fields-update', makeQuery)

			makeQuery()

			return () => {
				this.#events.removeEventListener('fields-update', makeQuery)
			}
		})
	}

	liveGetFields(options?: GlobalListingOptions) {
		return new Observable<LiveQuery<ReturnType<Database['getFields']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const makeQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getFields(options);
				subscriber.next({status: 'success', data: results})
			}

			this.#events.addEventListener('fields-update', makeQuery)

			makeQuery()

			return () => {
				this.#events.removeEventListener('fields-update', makeQuery)
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

	async getFieldVersions(id: string) {
		await this.#ensureInit()
		console.debug(`[database] running getFieldVersions: ${id}`)

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
			.where(eq(fieldsVersions.entityId, id))
			.orderBy(desc(fieldsVersions.createdAt)) as unknown as FieldVersionDto[];
	}

	async deleteFieldVersion(id: string): Promise<void> {
		const currentVersion = await this.#database
			.select({id: fieldsVersions.id, entityId: fieldsVersions.entityId})
			.from(fieldsVersions)
			.where(eq(fieldsVersions.id, id))
		if (!currentVersion) {
			throw new Error('Version not found')
		}

		const currentEntity = await this.#database
			.select({id: fields.id, currentVersionId: fields.currentVersionId})
			.from(fields)
			.where(eq(fields.id, currentVersion[0].entityId))
		if (!currentVersion) {
			throw new Error('Entity for version not found')
		}

		if (currentEntity[0].currentVersionId === id) {
			throw new Error('Attempted to delete current version')
		}

		await this.#database
			.delete(fieldsVersions)
			.where(eq(fieldsVersions.entityId, id))

		this.#eventService.dispatch('data-change', {databaseId: this.#databaseId, tableKey: 'fields', id: id, action: 'delete-version'})
	}

	liveGetFieldVersions(id: string) {
		return new Observable<LiveQuery<ReturnType<Database['getFieldVersions']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const makeQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getFieldVersions(id);
				subscriber.next({status: 'success', data: results})
			}

			const checkEvent = (event: CustomEvent) => {
				makeQuery()
			}
			this.#eventService.subscribe('data-change', checkEvent)

			return () => {
				this.#eventService.subscribe('data-change', checkEvent)
			}
		})
	}

	/**
	 * Content items
	 */
	async createContentType(createDto: CreateContentTypeDto): Promise<ContentTypeDto> {
		await this.#ensureInit()
		console.debug(`[database] running createContentType`)

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
				//
				name: createDto.name,
				icon: createDto.icon,
				colour: createDto.colour,
				description: createDto.description,
				templateName: createDto.templateName,
				templateFields: createDto.templateFields,
			})

		this.#eventService.dispatch('data-change', {databaseId: this.#databaseId, tableKey: 'content_types', id: entityId, action: 'create'})

		return this.getField(entityId)
	}

	async updateField(id: string, updateDto: UpdateContentTypeDto): Promise<ContentTypeDto> {
		await this.#ensureInit()
		console.debug(`[database] running update field`)

		const currentField = await this.getField(id)

		if (currentField.type !== updateDto.type) {
			throw new Error('Attempted to change type of field')
		}

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		await this.#database
			.update(fields)
			.set({
				currentVersionId: versionId,
			})
			.where(eq(fields.id, id))

		await this.#database
			.insert(fieldsVersions)
			.values({
				id: versionId,
				createdAt: updatedAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId: id,
				previousVersionId: currentField.versionId,
				createdBy: updateDto.createdBy,
				type: updateDto.type,
				name: updateDto.name,
				description: updateDto.description,
				icon: updateDto.icon,
				settings: 'settings' in updateDto ? updateDto.settings : null,
			})

		this.#events.dispatchEvent(new CustomEvent('fields-update'))
		this.#broadcastChannel.postMessage({type: 'fields-update'})

		// Return the updated field
		// todo: do this via "returning" in version insert?
		return this.getField(id)
	}

	async deleteField(id: string): Promise<void> {
		await this.#ensureInit()
		console.debug(`[database] running delete field: ${id}`)

		// todo: throw error on?

		await this.#database
			.update(fields)
			.set({
				isDeleted: true,
			})
			.where(eq(fields.id, id))

		await this.#database
			.delete(fieldsVersions)
			.where(eq(fieldsVersions.entityId, id))

		this.#events.dispatchEvent(new CustomEvent('fields-update'))
		this.#broadcastChannel.postMessage({type: 'fields-update'})
	}

	async getField(id: string): Promise<ContentTypeDto> {
		await this.#ensureInit()
		console.debug(`[database] running get field: ${id}`)

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
					eq(fields.id, id),
					eq(fields.currentVersionId, fieldsVersions.id)
				)
			)
			.orderBy(desc(fieldsVersions.createdAt)) as unknown as FieldDto;
	}

	async getFields(options?: GlobalListingOptions): Promise<ContentTypeDto[]> {
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

	liveGetField(id: string) {
		return new Observable<LiveQuery<ReturnType<Database['getField']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const makeQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getField(id);
				subscriber.next({status: 'success', data: results})
			}

			this.#events.addEventListener('fields-update', makeQuery)

			makeQuery()

			return () => {
				this.#events.removeEventListener('fields-update', makeQuery)
			}
		})
	}

	liveGetFields(options?: GlobalListingOptions) {
		return new Observable<LiveQuery<ReturnType<Database['getFields']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const makeQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getFields(options);
				subscriber.next({status: 'success', data: results})
			}

			this.#events.addEventListener('fields-update', makeQuery)

			makeQuery()

			return () => {
				this.#events.removeEventListener('fields-update', makeQuery)
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

	async getFieldVersions(id: string) {
		await this.#ensureInit()
		console.debug(`[database] running getFieldVersions: ${id}`)

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
			.where(eq(fieldsVersions.entityId, id))
			.orderBy(desc(fieldsVersions.createdAt)) as unknown as FieldVersionDto[];
	}

	async deleteFieldVersion(id: string): Promise<void> {
		const currentVersion = await this.#database
			.select({id: fieldsVersions.id, entityId: fieldsVersions.entityId})
			.from(fieldsVersions)
			.where(eq(fieldsVersions.id, id))
		if (!currentVersion) {
			throw new Error('Version not found')
		}

		const currentEntity = await this.#database
			.select({id: fields.id, currentVersionId: fields.currentVersionId})
			.from(fields)
			.where(eq(fields.id, currentVersion[0].entityId))
		if (!currentVersion) {
			throw new Error('Entity for version not found')
		}

		if (currentEntity[0].currentVersionId === id) {
			throw new Error('Attempted to delete current version')
		}

		await this.#database
			.delete(fieldsVersions)
			.where(eq(fieldsVersions.entityId, id))

		this.#events.dispatchEvent(new CustomEvent('fields-version-update'))
		this.#broadcastChannel.postMessage({type: 'fields-version-update'})
	}

	liveGetFieldVersions(id: string) {
		return new Observable<LiveQuery<ReturnType<Database['getFieldVersions']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const makeQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getFieldVersions(id);
				subscriber.next({status: 'success', data: results})
			}

			this.#events.addEventListener('fields-update', makeQuery)
			this.#events.addEventListener('fields-version-update', makeQuery)

			makeQuery()

			return () => {
				this.#events.removeEventListener('fields-update', makeQuery)
				this.#events.removeEventListener('fields-version-update', makeQuery)
			}
		})
	}
}
