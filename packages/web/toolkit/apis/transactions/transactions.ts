import {
	ErrorTypes,
	HeadbaseError,
	LIVE_QUERY_LOADING_STATE,
	LiveQueryResult,
	LiveQueryStatus,
	QueryResult
} from "../../control-flow";
import {EncryptionService} from "../../services/encryption/encryption";
import {memoryCache} from "../../services/memory-cache.service";
import {Observable} from "rxjs";
import {DataEntityChangeEvent, EventTypes} from "../../services/events/events";
import {IDBPDatabase, openDB} from "idb";
import {
	Entity,
	EntityCreateDto,
	EntityDto,
	EntityUpdate,
	EntityVersion,
	LocalEntity
} from "../../schemas/common/entities";
import {EventsService} from "../../services/events/events.service";
import {Logger} from "../../../src/utils/logger";
import {HEADBASE_INDEXDB_ENTITY_VERSION, HEADBASE_VERSION} from "../../headbase-web";
import {TimestampField} from "../../schemas/common/fields";
import {QueryDefinition, QueryIndex} from "../../schemas/query";
import {ExportData} from "../../schemas/export";
import {KeyStorageService} from "../../services/key-storage.service";
import {DatabasesAPI} from "../databases";
import {createIdField} from "@headbase-app/common";
import {TableTypes, TableKeys, LocalEntityWithExposedFields} from "../../schemas/schema";

export interface TransactionsAPIDependencies {
	eventsService: EventsService
	databases: DatabasesAPI
}

export interface ConnectionStore {
	[databaseId: string]: IDBPDatabase
}

// todo: more closely align with types?
const TABLES = {
	tags: {
		exposedFields: null,
		useMemoryCache: true
	},
	fields: {
		exposedFields: null,
		useMemoryCache: true
	},
	content_types: {
		exposedFields: {
			fields: 'plain',
			contentTemplateTags: 'plain',
		},
		useMemoryCache: true
	},
	content: {
		exposedFields: {
			type: 'indexed',
			tags: 'plain',
			isFavourite: 'plain'
		},
		useMemoryCache: false
	},
	views: {
		exposedFields: {
			isFavourite: 'indexed',
			tags: 'plain',
			queryTags: 'plain',
			queryContentTypes: 'plain'
		},
		useMemoryCache: false
	}
} as const

export class TransactionsAPI {
	readonly #connectionStore: ConnectionStore
	readonly #eventsService: EventsService
	readonly #databases: DatabasesAPI

	constructor(
		deps: TransactionsAPIDependencies
	) {
		this.#connectionStore = {}
		this.#eventsService = deps.eventsService
		this.#databases = deps.databases
	}

	private async getIndexDbDatabase(databaseId: string) {
		if (this.#connectionStore[databaseId]) {
			return this.#connectionStore[databaseId]
		}

		// ensure the database actually exists locally in application storage before opening/creating the IndexDB databases.
		await this.#databases.get(databaseId)

		this.#connectionStore[databaseId] = await openDB(databaseId, HEADBASE_INDEXDB_ENTITY_VERSION, {
			// todo: handle upgrades to existing database versions
			upgrade: (db) => {

				for (const [tableKey, schemaDefinition] of Object.entries(TABLES)) {
					// Create entity store
					const entityStore = db.createObjectStore(tableKey, {
						keyPath: 'id',
						autoIncrement: false
					})
					entityStore.createIndex('isDeleted', 'isDeleted')
					entityStore.createIndex('createdAt', ['createdAt', 'isDeleted'])

					// Add exposed field indexes
					if (schemaDefinition.exposedFields) {
						for (const [exposedField, fieldType] of Object.entries(schemaDefinition.exposedFields)) {
							if (fieldType === 'indexed') {
								// todo: add createdAt to index, which might help with sorting?
								entityStore.createIndex(exposedField, [exposedField, 'isDeleted'])
							}
						}
					}

					// Create entity version store
					const entityVersionStore = db.createObjectStore(this._getVersionTableName(tableKey), {
						keyPath: 'id',
						autoIncrement: false
					})
					entityVersionStore.createIndex('entityId', 'entityId')
					entityVersionStore.createIndex('createdAt', 'createdAt')
				}
			},
		})

		return this.#connectionStore[databaseId]
	}

	async close(databaseId: string) {
		if (this.#connectionStore[databaseId]) {
			this.#connectionStore[databaseId].close()
			delete this.#connectionStore[databaseId]
		}
		this.#eventsService.dispatch(EventTypes.DATABASE_CLOSE, {id: databaseId})
	}

	async closeAll() {
		for (const databaseId of Object.keys(this.#connectionStore)) {
			await this.close(databaseId)
		}
	}
	
	private _getVersionTableName(tableKey: string): string {
		return `${tableKey}_versions`
	}

	/**
	 * Create a DTO object from the given entity and version.
	 *
	 * @param databaseId
	 * @param tableKey
	 * @param entity
	 * @param version
	 */
	async _createEntityVersionDto<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, entity: Entity, version: EntityVersion): Promise<EntityDto<TableTypes[TableKey]>> {
		const encryptionKey = await KeyStorageService.get(databaseId)
		if (!encryptionKey) throw new Error(`encryptionKey not found for database ${databaseId}`)

		let data
		try {
			data = await EncryptionService.decrypt(
				encryptionKey,
				version.data,
			)
		}
		catch (e) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_PASSWORD_OR_KEY, originalError: e})
		}

		// todo: add validating schema and version data?
		// this would ensure data is valid, but may cause serious performance issue if loading lots of data

		// @ts-expect-error -- just get it working
		return {
			id: entity.id,
			versionId: version.id,
			createdAt: entity.createdAt,
			updatedAt: version.createdAt,
			data: data,
			headbaseVersion: entity.headbaseVersion,
			isDeleted: entity.isDeleted,
		}
	}

	/**
	 * Get a single entity, loading the current version.
	 *
	 * @param databaseId
	 * @param tableKey
	 * @param id
	 */
	async get<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, id: string): Promise<EntityDto<TableTypes[TableKey]>> {
		if (TABLES[tableKey].useMemoryCache) {
			const cachedResponse = await memoryCache.get<EntityDto<TableTypes[TableKey]>>(`${tableKey}-get-${id}`)
			if (cachedResponse) {
				return cachedResponse
			}
		}

		const db = await this.getIndexDbDatabase(databaseId)
		const tx = db.transaction([tableKey, this._getVersionTableName(tableKey)], 'readonly')
		const entity = await tx.objectStore(tableKey).get(id) as LocalEntity|undefined
		if (!entity) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND, devMessage: `entity ${id} could not be found.`})
		}

		let version: EntityVersion|undefined = undefined
		if (entity.currentVersionId) {
			version = await tx.objectStore(this._getVersionTableName(tableKey)).get(entity.currentVersionId) as EntityVersion|undefined

			// Don't fall back to loading latest version as this state should never be possible and shouldn't fail silently.
			if (!version) {
				throw new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND, devMessage: `entity ${id} has no currentVersionId set`})
			}
		}
		else {
			const allVersions = await tx.objectStore(this._getVersionTableName(tableKey)).getAll() as EntityVersion[]
			const sortedVersions = allVersions.sort((a, b) => {
				return a.createdAt < b.createdAt ? 1 : 0
			})
			if (sortedVersions[0]) {
				version = sortedVersions[0]
			}
			else {
				throw new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND, devMessage: `entity ${id} has no versions`})
			}
		}

		await tx.done

		const dto = await this._createEntityVersionDto<TableKey>(databaseId, tableKey, entity, version)

		if (TABLES[tableKey].useMemoryCache) {
			await memoryCache.add(`${tableKey}-get-${id}`, dto)
		}

		return dto
	}

	/**
	 * Get multiple entities, loading the current version for each.
	 *
	 * @param databaseId
	 * @param tableKey
	 * @param ids
	 */
	async getMany<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, ids: string[]): Promise<QueryResult<EntityDto<TableTypes[TableKey]>[]>> {
		const dtos: EntityDto<TableTypes[TableKey]>[] = []
		const errors: unknown[] = []

		for (const id of ids) {
			try {
				const dto = await this.get(databaseId, tableKey, id)
				dtos.push(dto)
			}
			catch (e) {
				errors.push(e)
			}
		}

		return {result: dtos, errors: errors}
	}

	/**
	 * Create a new entity.
	 * This will generate ids and timestamps before using ._create to actually create tne entity.
	 *
	 * @param databaseId
	 * @param tableKey
	 * @param data
	 */
	async create<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, data: TableTypes[TableKey]): Promise<string> {
		const entityId = EncryptionService.generateUUID();
		const timestamp = new Date().toISOString();

		await this._create(databaseId, tableKey, {
			id: entityId,
			isDeleted: 0,
			createdAt: timestamp,
			updatedAt: timestamp,
			headbaseVersion: HEADBASE_VERSION,
			data,
		})

		return entityId
	}

	/**
	 * The base method for creating new entities which is shared by both .create and .import.
	 *
	 * @param databaseId
	 * @param tableKey
	 * @param entityCreateDto
	 */
	private async _create<TableKey extends TableKeys>(
		databaseId: string,
		tableKey: TableKey,
		entityCreateDto: EntityCreateDto<TableTypes[TableKey]>
	): Promise<void> {
		// todo: data should be validated here using schema validator before saving

		const db = await this.getIndexDbDatabase(databaseId)

		const versionId = EncryptionService.generateUUID();

		const encryptionKey = await KeyStorageService.get(databaseId)
		if (!encryptionKey) throw new Error(`encryptionKey not found for database ${databaseId}`)
		const encResult = await EncryptionService.encrypt(encryptionKey, entityCreateDto.data)

		const tx = db.transaction([tableKey, this._getVersionTableName(tableKey)], 'readwrite')

		const version: EntityVersion = {
			entityId: entityCreateDto.id,
			id: versionId,
			data: encResult,
			createdAt: entityCreateDto.createdAt,
			headbaseVersion: entityCreateDto.headbaseVersion,
		}
		await tx.objectStore(this._getVersionTableName(tableKey)).add(version)

		const entity = {
			id: entityCreateDto.id,
			isDeleted: 0,
			createdAt: entityCreateDto.updatedAt,
			headbaseVersion: entityCreateDto.headbaseVersion,
			currentVersionId: versionId
		}

		// Process exposed fields, and add these to the entity before saving.
		const exposedFields = TABLES[tableKey].exposedFields
		if (exposedFields) {
			for (const field of Object.keys(exposedFields)) {
				// @ts-expect-error -- todo: types - improve exposed fields type checking?
				entity[field] = entityCreateDto.data[field]
			}
		}

		await tx.objectStore(tableKey).add(entity)

		await tx.done

		this.#eventsService.dispatch( EventTypes.DATA_CHANGE, { databaseId: databaseId, tableKey: tableKey, action: 'create', id: entityCreateDto.id})

	}

	/**
	 * Update the given entity.
	 * This will load the latest version, apply the given updates, and create a
	 * new version with the updates.
	 *
	 * @param databaseId
	 * @param tableKey
	 * @param entityId
	 * @param dataUpdate
	 * @param preventEventDispatch - UUseful in situations like data migrations, where an update is done while fetching data so an event shouldn't be triggered.
	 */
	async update<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, entityId: string, dataUpdate: EntityUpdate<TableTypes[TableKey]>, preventEventDispatch?: boolean): Promise<string> {
		const oldEntity = await this.get(databaseId, tableKey, entityId)

		if (TABLES[tableKey].useMemoryCache) {
			await memoryCache.delete(`${tableKey}-get-${entityId}`)
			await memoryCache.delete(`${tableKey}-getAll`)
		}

		// Pick out all entity/version fields, which will leave only data fields.
		const updatedData = {
			...oldEntity.data,
			...dataUpdate
		}

		// todo: updated data should be validated here using schema validator before saving

		const encryptionKey = await KeyStorageService.get(databaseId)
		if (!encryptionKey) throw new Error(`encryptionKey not found for database ${databaseId}`)

		const encResult = await EncryptionService.encrypt(encryptionKey, updatedData)

		const versionId = EncryptionService.generateUUID();
		const timestamp = new Date().toISOString();

		const db = await this.getIndexDbDatabase(databaseId)
		const tx = db.transaction([tableKey, this._getVersionTableName(tableKey)], 'readwrite')

		const newVersion: EntityVersion = {
			entityId: entityId,
			id: versionId,
			createdAt: timestamp,
			headbaseVersion: HEADBASE_VERSION,
			data: encResult,
		}
		await tx.objectStore(this._getVersionTableName(tableKey)).add(newVersion)

		const updatedEntity = {
			id: oldEntity.id,
			createdAt: oldEntity.createdAt,
			isDeleted: oldEntity.isDeleted,
			headbaseVersion: oldEntity.headbaseVersion,
			currentVersionId: versionId
		}

		// Process exposed fields, adding them to the updated entity before saving.
		const exposedFields = TABLES[tableKey].exposedFields
		if (exposedFields) {
			for (const field of Object.keys(exposedFields)) {
				// @ts-expect-error -- todo: types - improve exposed fields type checking?
				updatedEntity[field] = updatedData[field]
			}
		}

		await tx.objectStore(tableKey).put(updatedEntity)

		await tx.done

		if (!preventEventDispatch) {
			this.#eventsService.dispatch( EventTypes.DATA_CHANGE, { databaseId: databaseId, tableKey: tableKey, action: 'update', id: entityId})
		}

		return versionId
	}

	/**
	 * Delete the given entity, setting the 'isDeleted' flag ont eh entity and
	 * deleting all versions.
	 */
	async delete<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, entityId: string): Promise<void> {
		const currentEntity = await this.get(databaseId, tableKey, entityId)

		const db = await this.getIndexDbDatabase(databaseId)

		if (TABLES[tableKey].useMemoryCache) {
			await memoryCache.delete(`${tableKey}-get-${entityId}`)
			await memoryCache.delete(`${tableKey}-getAll`)
		}

		const tx = db.transaction([tableKey, this._getVersionTableName(tableKey)], 'readwrite')
		const entityStore = tx.objectStore(tableKey)

		const updatedEntity: LocalEntity = {
			id: currentEntity.id,
			createdAt: currentEntity.createdAt,
			headbaseVersion: currentEntity.headbaseVersion,
			currentVersionId: currentEntity.versionId,
			isDeleted: 1
		}
		// The keypath 'id' is supplied, so no need to also supply this in the second arg
		await entityStore.put(updatedEntity)

		const versionStore = tx.objectStore(this._getVersionTableName(tableKey))
		const versionsIndex = versionStore.index('entityId')
		let deletionCursor = await versionsIndex.openCursor(entityId)
		while (deletionCursor) {
			deletionCursor.delete()
			deletionCursor = await deletionCursor.continue()
		}

		await tx.done

		this.#eventsService.dispatch( EventTypes.DATA_CHANGE, { databaseId: databaseId, tableKey: tableKey, action: 'delete', id: entityId})
	}

	/**
	 * Query for content.
	 */
	async query<TableKey extends TableKeys>(databaseId: string, query: QueryDefinition<TableKey>): Promise<QueryResult<EntityDto<TableTypes[TableKey]>[]>> {
		// todo: add query memory cache?

		const db = await this.getIndexDbDatabase(databaseId)
		const tx = db.transaction([query.table, this._getVersionTableName(query.table)], 'readonly')

		// Pick what index and cursor query to use for the initial data selection
		// In the case of an "includes" operation on the index, there will be one index for each value.
		const indexes: QueryIndex[] = []
		if (query.index) {
			const exposedFields = TABLES[query.table].exposedFields
			// @ts-expect-error -- todo: types - improve exposed fields type checking?
			if (!exposedFields || !exposedFields[query.index.field]) {
				throw new Error("Attempted to use an exposed field that does not exist.")
			}
			// @ts-expect-error -- todo: types - improve exposed fields type checking?
			else if (exposedFields[query.index.field] !== 'indexed') {
				throw new Error("Attempted to use an exposed fields that isn't of type 'indexed'.")
			}


			if (query.index.operation === 'equal') {
				indexes.push({
					// @ts-expect-error - query.index.field will be the name of the index
					index: tx.objectStore(query.table).index(query.index.field),
					query: IDBKeyRange.only([query.index.value, 0]) // [value, isDeleted]
				})
			}
			else if (query.index.operation === 'includes') {
				for (const value of query.index.value) {
					indexes.push({
						// @ts-expect-error - query.index.field will be the name of the index
						index: tx.objectStore(query.table).index(query.index.field),
						query: IDBKeyRange.only([value, 0]) // [value, isDeleted]
					})
				}
			}
			else {
				if (
					(typeof query.index.greaterThan !== "undefined" && typeof query.index.greaterThanEqualTo !== "undefined") ||
					(typeof query.index.lessThan !== "undefined" && typeof query.index.lessThanEqualTo !== "undefined")
				) {
					throw new Error("Attempted to use invalid combination of bounded and unbounded comparisons in query.")
				}

				let indexQuery
				if (typeof query.index.greaterThan !== "undefined" && typeof query.index.lessThan !== "undefined") {
					indexQuery = IDBKeyRange.bound([query.index.greaterThan, 0], [query.index.lessThan, 0], true, true)
				}
				else if (typeof query.index.greaterThanEqualTo !== "undefined" && typeof query.index.lessThanEqualTo !== "undefined") {
					indexQuery = IDBKeyRange.bound([query.index.greaterThan, 0], [query.index.lessThan, 0], false, false)
				}
				if (typeof query.index.greaterThan !== "undefined" && typeof query.index.lessThanEqualTo !== "undefined") {
					indexQuery = IDBKeyRange.bound([query.index.greaterThan, 0], [query.index.lessThan, 0], true, false)
				}
				if (typeof query.index.greaterThanEqualTo !== "undefined" && typeof query.index.lessThanEqualTo !== "undefined") {
					indexQuery = IDBKeyRange.bound([query.index.greaterThan, 0], [query.index.lessThan, 0], false, true)
				}
				if (typeof query.index.greaterThanEqualTo !== "undefined") {
					indexQuery = IDBKeyRange.lowerBound([query.index.greaterThanEqualTo, 0], false)
				}
				if (typeof query.index.greaterThan !== "undefined") {
					indexQuery = IDBKeyRange.lowerBound([query.index.greaterThanEqualTo, 0], true)
				}
				if (typeof query.index.lessThanEqualTo !== "undefined") {
					indexQuery = IDBKeyRange.upperBound([query.index.greaterThanEqualTo, 0], false)
				}
				if (typeof query.index.lessThan !== "undefined") {
					indexQuery = IDBKeyRange.upperBound([query.index.greaterThanEqualTo, 0], true)
				}

				indexes.push({
					// @ts-expect-error - query.index.field will be the name of the index
					index: tx.objectStore(query.table).index(query.index.field),
					query: indexQuery
				})
			}
		}
		else {
			indexes.push({
				// @ts-expect-error - this is a valid index. todo: a generics issue with QueryIndex?
				index: tx.objectStore(query.table).index('isDeleted'),
				query: 0
			})
		}

		const cursorResults: {entity: LocalEntity, version: EntityVersion}[] = []
		const errors: unknown[] = []

		// Iterate over all indexes and all items in the index cursor, also running the user-supplied whereCursor function.
		for (const queryIndex of indexes) {
			for await (const entityCursor of queryIndex.index.iterate(queryIndex.query, queryIndex.direction)) {
				const entity = entityCursor.value as LocalEntityWithExposedFields<TableKey>
				let version: EntityVersion|undefined = undefined
				if (entity.currentVersionId) {
					version = await tx.objectStore(this._getVersionTableName(query.table)).get(entity.currentVersionId) as EntityVersion|undefined

					// Don't fall back to loading latest version as this state should never be possible and shouldn't fail silently.
					if (!version) {
						errors.push(new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND, devMessage: `entity ${entity.id} has no currentVersionId set`}))
						break
					}
				}
				else {
					const allVersions = await tx.objectStore(this._getVersionTableName(query.table)).getAll() as EntityVersion[]
					const sortedVersions = allVersions.sort((a, b) => {
						return a.createdAt < b.createdAt ? 1 : 0
					})
					if (sortedVersions[0]) {
						version = sortedVersions[0]
					}
					else {
						errors.push(new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND, devMessage: `entity ${entity.id} has no versions`}))
						break
					}
				}

				let include = true
				if (query.whereCursor) {
					include = query.whereCursor(entity, version)
				}
				if (include) {
					cursorResults.push({entity: entity, version: version})
				}
			}
		}

		await tx.done

		const dataFilterResults: EntityDto<TableTypes[TableKey]>[] = []
		for (const result of cursorResults) {
			const dto = await this._createEntityVersionDto<TableKey>(
				databaseId,
				query.table,
				result.entity,
				result.version,
			)

			// Run any defined whereData queries.
			let includeInResults = true
			if (query.whereData) {
				includeInResults = query.whereData(dto)
			}

			if (includeInResults) {
				dataFilterResults.push(dto)
			}
		}

		let sortedResults
		if (query.sort) {
			sortedResults = query.sort(dataFilterResults)
		}
		else {
			sortedResults = dataFilterResults.sort((a, b) => {
				return a.updatedAt > b.updatedAt ? 1 : -1
			})
		}

		// todo: add query memory cache?

		return {
			result: sortedResults,
			errors: errors
		}
	}


	/**
	 * Get all versions
	 *
	 * @param databaseId
	 * @param tableKey
	 * @param entityId
	 */
	async getAllVersions<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, entityId: string): Promise<EntityVersion[]> {
		const db = await this.getIndexDbDatabase(databaseId)

		return await db.getAllFromIndex(this._getVersionTableName(tableKey), 'entityId', entityId)
	}

	/**
	 * Delete all versions except the most recent.
	 */
	async deleteOldVersions<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, entityId: string): Promise<void> {
		const db = await this.getIndexDbDatabase(databaseId)

		const versions = await this.getAllVersions(databaseId, tableKey, entityId)

		const sortedVersions = versions.sort((a, b) => {
			return a.createdAt < b.createdAt ? 1 : 0
		})
		if (!sortedVersions[0]) {
			throw new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND, devMessage: `entity ${entityId} has no versions`})
		}

		const tx = db.transaction(this._getVersionTableName(tableKey), 'readwrite')
		const versionsIndex = tx.store.index('entityId')
		let deletionCursor = await versionsIndex.openKeyCursor(entityId)
		while (deletionCursor) {
			if (deletionCursor.key !== sortedVersions[0].id) {
				await deletionCursor.delete()
			}
			deletionCursor = await deletionCursor.continue()
		}

		await tx.done
	}

	/**
	 * Delete the given version, will fail if the given version is the latest.
	 *
	 * @param databaseId
	 * @param tableKey
	 * @param versionId
	 */
	async deleteVersion<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, versionId: string): Promise<void> {
		const db = await this.getIndexDbDatabase(databaseId)
		await db.delete(this._getVersionTableName(tableKey), versionId)
	}

	/**
	 * Fetch a single version
	 *
	 * @param databaseId
	 * @param tableKey
	 * @param versionId
	 */
	async getVersion<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, versionId: string): Promise<EntityVersion> {
		const db = await this.getIndexDbDatabase(databaseId)
		return await db.get(this._getVersionTableName(tableKey), versionId)
	}

	/**
	 * Fetch the entity from the entity table.
	 *
	 * @param databaseId
	 * @param tableKey
	 * @param entityId
	 */
	async _getEntity<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, entityId: string): Promise<LocalEntity> {
		const db = await this.getIndexDbDatabase(databaseId)

		const entity = await db.get(tableKey, entityId)

		if (!entity || entity.isDeleted === 1) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND, devMessage: `entity ${entityId} could not be found`})
		}

		return entity
	}

	liveGet<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, id: string) {
		return new Observable<LiveQueryResult<EntityDto<TableTypes[TableKey]>>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				subscriber.next(LIVE_QUERY_LOADING_STATE)

				try {
					const dto = await this.get(databaseId, tableKey, id)
					subscriber.next({status: LiveQueryStatus.SUCCESS, result: dto})
				}
				catch (e) {
					subscriber.next({status: LiveQueryStatus.ERROR, errors: [e]})
				}
			}

			const handleEvent = (e: CustomEvent<DataEntityChangeEvent['detail']>) => {
				// Discard if tableKey or ID doesn't match, as the data won't have changed.
				if (e.detail.data.databaseId === databaseId && e.detail.data.tableKey === tableKey && e.detail.data.id === id) {
					Logger.debug(`[observableGet] Received event that requires re-query`)
					runQuery()
				}
			}

			this.#eventsService.subscribe(EventTypes.DATA_CHANGE, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.#eventsService.unsubscribe(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}
	
	liveGetMany<TableKey extends TableKeys>(databaseId: string, tableKey: TableKey, ids: string[]) {
		return new Observable<LiveQueryResult<EntityDto<TableTypes[TableKey]>[]>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				subscriber.next(LIVE_QUERY_LOADING_STATE)

				try {
					const query = await this.getMany(databaseId, tableKey, ids)
					subscriber.next({status: LiveQueryStatus.SUCCESS, result: query.result, errors: query.errors})
				}
				catch (e) {
					subscriber.next({status: LiveQueryStatus.ERROR, errors: [e]})
				}
			}

			const handleEvent = (e: CustomEvent<DataEntityChangeEvent['detail']>) => {
				if (e.detail.data.databaseId === databaseId && e.detail.data.tableKey === tableKey && ids.includes(e.detail.data.id)) {
					runQuery()
				}
			}

			this.#eventsService.subscribe(EventTypes.DATA_CHANGE, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.#eventsService.unsubscribe(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	liveQuery<TableKey extends TableKeys>(databaseId: string, query: QueryDefinition<TableKey>) {
		return new Observable<LiveQueryResult<EntityDto<TableTypes[TableKey]>[]>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				subscriber.next(LIVE_QUERY_LOADING_STATE)

				try {
					const queryResult = await this.query(databaseId, query)
					subscriber.next({status: LiveQueryStatus.SUCCESS, result: queryResult.result, errors: queryResult.errors})
				}
				catch (e) {
					subscriber.next({status: LiveQueryStatus.ERROR, errors: [e]})
				}
			}

			const handleEvent = (e: CustomEvent<DataEntityChangeEvent['detail']>) => {
				if (e.detail.data.databaseId === databaseId && e.detail.data.tableKey === query.table) {
					runQuery()
				}
			}

			this.#eventsService.subscribe(EventTypes.DATA_CHANGE, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.#eventsService.unsubscribe(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	async export(databaseId: string): Promise<ExportData> {
		const entityKeys = Object.keys(TABLES)

		const exportData: ExportData = {
			exportVersion: 'v1',
			data: {}
		}

		for (const entityKey of entityKeys) {
			const allDataQuery = await this.query(databaseId, {table: entityKey as unknown as TableKeys})

			// @ts-expect-error -- just get it working
			exportData.data[entityKey] = allDataQuery.result.map(dto => {
				return {
					id: dto.id,
					headbaseVersion: dto.headbaseVersion,
					createdAt: dto.createdAt,
					updatedAt: dto.updatedAt,
					data: dto.data,
				}
			})
		}

		return exportData
	}

	async import(databaseId: string, importData: ExportData): Promise<void> {
		if (importData.exportVersion !== 'v1') {
			throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: "Unrecognized or missing export version"})
		}

		if (!importData.data) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: "Unrecognized or missing export data"})
		}

		const validTableKeys = Object.keys(TABLES)
		const importTableKeys = Object.keys(importData.data)
		for (const importTableKey of importTableKeys) {
			if (!validTableKeys.includes(importTableKey)) {
				throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: `Unrecognized table ${importTableKey} in import data`})
			}
			// @ts-expect-error -- just get it working
			if (!Array.isArray(importData.data[importTableKey])) {
				throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: `Invalid table ${importTableKey} in import data`})
			}
		}

		for (const importTableKey of importTableKeys) {
			// @ts-expect-error -- just get it working
			for (const entityToImport of importData.data[importTableKey]) {
				let id
				let createdAt
				let updatedAt
				try {
					id = createIdField().parse(entityToImport.id)
					createdAt = TimestampField.parse(entityToImport.createdAt)
					updatedAt = TimestampField.parse(entityToImport.updatedAt)
				}
				catch (e) {
					throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: `Invalid entity data for ${importTableKey} entity ${entityToImport.id}`, originalError: e})
				}

				if (entityToImport.headbaseVersion !== HEADBASE_VERSION) {
					throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: `Unrecognised Headbase version ${entityToImport.headbaseVersion} for ${importTableKey} entity ${entityToImport.id}`})
				}

				let dataIsValid = false
				try {
					// @ts-expect-error -- just get it working
					dataIsValid = await TableTypes[importTableKey].parse(entityToImport.data)
				}
				catch (e) {
					throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: `Validator function failed unexpectedly for ${importTableKey} entity ${entityToImport.id}`, originalError: e})
				}
				if (!dataIsValid) {
					throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: `Data for ${importTableKey} entity ${entityToImport.id} failed validation`})
				}
				const dataToImport = entityToImport.data

				// Ensure that the item doesn't already exist
				let existingItem
				try {
					// @ts-expect-error -- just get it working
					existingItem = await this.get(databaseId, importTableKey, entityToImport.id)
				}
				catch (e) {
					if (e instanceof HeadbaseError && e.cause.type !== ErrorTypes.ENTITY_NOT_FOUND) {
						throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, originalError: e, devMessage: `Error occurred while attempting to check if ${importTableKey} entity ${entityToImport.id} exists. `})
					}
				}
				if (existingItem) {
					throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: `Attempted to import ${importTableKey} entity ${entityToImport.id} which already exists`})
				}

				try {
					// @ts-expect-error -- just get it working
					await this._create(databaseId, importTableKey, {
						id,
						createdAt,
						updatedAt,
						isDeleted: 0,
						headbaseVersion: entityToImport.headbaseVersion,
						data: dataToImport
					})
					console.debug(`Created ${importTableKey} entity ${entityToImport.id}`)
				}
				catch (e) {
					throw new HeadbaseError({
						type: ErrorTypes.SYSTEM_ERROR,
						devMessage: `Error occurred while attempting to create ${importTableKey} entity ${entityToImport.id}.`,
						originalError: e,
					})
				}
			}
		}
	}
}
