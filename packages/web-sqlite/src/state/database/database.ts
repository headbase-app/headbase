import {drizzle, SqliteRemoteDatabase} from 'drizzle-orm/sqlite-proxy';
import {and, desc, eq, sql} from "drizzle-orm";
import {Observable} from "rxjs";

import migration1 from "./migrations/00-setup.sql?raw"
import {WebClientAdapter} from "./adapters/web-client-adapter.ts";
import {fieldsVersions, fields, FieldDto} from "./schema/tables/fields/fields.ts";
import {CreateFieldDto} from "./schema/tables/fields/fields.ts";
import {contentItems, contentItemsVersions} from "./schema/tables/content-items/content-items.ts";
import {WorkerClientAdapter} from "./adapters/worker/worker-client-adapter.ts";


const HEADBASE_VERSION = '1.0'
const SCHEMA = {
	fields, fieldsVersions,
	contentItems, contentItemsVersions
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
	databaseAdapter: typeof WebClientAdapter | typeof WorkerClientAdapter
}


export class Database {
	readonly #contextId: string;

	readonly #databaseId: string;
	readonly #databaseAdapter: WebClientAdapter | WorkerClientAdapter;
	readonly #database: SqliteRemoteDatabase<typeof SCHEMA>
	#hasInit: boolean

	readonly #events: EventTarget
	readonly #broadcastChannel: BroadcastChannel

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

		this.#events = new EventTarget()
		this.#broadcastChannel = new BroadcastChannel(`headbase-${this.#databaseId}`)

		this.#broadcastChannel.addEventListener('message', this.#handleBroadcastEvent.bind(this))
		console.debug(`[database] init complete for '${databaseId}' using contextId '${this.#contextId}'`)
	}

	async #ensureInit() {
		if (!this.#hasInit) {
			console.debug(`[database] running migrations for '${this.#databaseId}'`);
			await this.#database.run(sql.raw(migration1))
			this.#hasInit = true
		}
	}

	async #handleBroadcastEvent(event: MessageEvent) {
		console.debug(`[broadcast] received broadcast message:`, event.data)
		// Relay events to local event target so everywhere only has to subscribe to the single event source.
		this.#events.dispatchEvent(new CustomEvent(event.data.type, event.data.detail))
	}

	async close() {
		console.debug(`[database] close started for database '${this.#databaseId}' from context '${this.#contextId}'`)
		this.#broadcastChannel.close()
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
				label: createDto.label,
				description: createDto.description,
				icon: createDto.icon,
				settings: 'settings' in createDto ? createDto.settings : null,
			})

		this.#events.dispatchEvent(new CustomEvent('fields-update'))
		this.#broadcastChannel.postMessage({type: 'fields-update'})

		return this.getField(entityId)
	}

	async updateField(id: string, updateDto: CreateFieldDto): Promise<FieldDto> {
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
				label: updateDto.label,
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

		// todo: throw error on

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
				label: fieldsVersions.label,
				description: fieldsVersions.description,
				icon: fieldsVersions.icon,
				settings: fieldsVersions.settings,
			})
			.from(fields)
			.innerJoin(fields, eq(fields.id, fieldsVersions.entityId))
			.where(
				and(
					eq(fields.id, id),
					eq(fields.currentVersionId, fieldsVersions.id)
				)
			)
			.orderBy(desc(fieldsVersions.createdAt)) as unknown as FieldDto;
	}

	async getFields(): Promise<FieldDto[]> {
		await this.#ensureInit()
		console.debug(`[database] running get fields`)

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
				label: fieldsVersions.label,
				description: fieldsVersions.description,
				icon: fieldsVersions.icon,
				settings: fieldsVersions.settings,
			})
			.from(fields)
			.innerJoin(fieldsVersions, eq(fields.id, fieldsVersions.entityId))
			.where(eq(fields.currentVersionId, fieldsVersions.id))
			.orderBy(desc(fieldsVersions.createdAt)) as unknown as FieldDto[];
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

	liveGetFields() {
		return new Observable<LiveQuery<ReturnType<Database['getFields']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const makeQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getFields();
				subscriber.next({status: 'success', data: results})
			}

			this.#events.addEventListener('fields-update', makeQuery)

			makeQuery()

			return () => {
				this.#events.removeEventListener('fields-update', makeQuery)
			}
		})
	}

	// async getFieldVersion(versionId: string) {
	// 	await this.#ensureInit()
	// 	console.debug(`[database] running get field version: ${versionId}`)
	//
	// 	return this.#database
	// 		.select({
	// 			id: fields.id,
	// 			createdAt: fields.createdAt,
	// 			updatedAt: fieldsVersions.createdAt,
	// 			isDeleted: fields.isDeleted,
	// 			versionId: fieldsVersions.id,
	// 			previousVersionId: fieldsVersions.previousVersionId,
	// 			versionCreatedBy: fieldsVersions.createdBy,
	// 			type: fieldsVersions.type,
	// 			label: fieldsVersions.label,
	// 			description: fieldsVersions.description,
	// 			icon: fieldsVersions.icon,
	// 			settings: fieldsVersions.settings,
	// 		})
	// 		.from(fieldsVersions)
	// 		.innerJoin(fields, eq(fields.id, fieldsVersions.entityId))
	// 		.where(eq(fieldsVersions.id, versionId)) as unknown as FieldDto;
	// }
	//
	// async getFieldVersions(id: string) {
	// 	await this.#ensureInit()
	// 	console.debug(`[database] running get fields: ${id}`)
	//
	// 	return this.#database
	// 		.select({
	// 			id: fields.id,
	// 			createdAt: fields.createdAt,
	// 			updatedAt: fieldsVersions.createdAt,
	// 			isDeleted: fields.isDeleted,
	// 			versionId: fieldsVersions.id,
	// 			previousVersionId: fieldsVersions.previousVersionId,
	// 			versionCreatedBy: fieldsVersions.createdBy,
	// 			type: fieldsVersions.type,
	// 			label: fieldsVersions.label,
	// 			description: fieldsVersions.description,
	// 			icon: fieldsVersions.icon,
	// 			settings: fieldsVersions.settings,
	// 		})
	// 		.from(fieldsVersions)
	// 		.innerJoin(fields, eq(fields.id, fieldsVersions.entityId))
	// 		.where(eq(fields.currentVersionId, fieldsVersions.id))
	// 		.orderBy(desc(fieldsVersions.createdAt)) as unknown as FieldDto[];
	// }
	//
	// async deleteFieldVersion(id: string): Promise<void> {}
	//
	// liveGetFieldVersions() {}

	/**
	 * Content items
	 */
	// async createContentItem(createDto: CreateContentItemDto): Promise<ContentItemDto> {}
	//
	// async updateContentItem(id: string, updateDto: UpdateContentItemDto): Promise<ContentItemDto> {}
	//
	// async deleteContentItem(id: string): Promise<void> {}
	//
	// async getContentItem(id: string): Promise<ContentItemDto> {}
	//
	// async getContentItems(): Promise<ContentItemDto> {}
	//
	// liveGetContentItem(): Observable<LiveQuery<ReturnType<Database['getContentItem']>>> {
	// 	return new Observable()
	// }
	//
	// liveGetContentItems(): Observable<LiveQuery<ReturnType<Database['getContentItems']>>> {
	// 	return new Observable()
	// }
	//
	// async getContentItemVersion(id: string): Promise<ContentItemDto> {}
	//
	// async getContentItemVersions(id: string): Promise<ContentItemDto[]> {}
	//
	// async deleteContentItemVersion(id: string): Promise<void> {}
	//
	// async liveGetContentItemVersions(id: string): Promise<ContentItemDto[]> {}
}
