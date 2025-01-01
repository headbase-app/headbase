import {
	ErrorTypes,
	HeadbaseError,
	LIVE_QUERY_LOADING_STATE,
	LiveQueryResult,
	LiveQueryStatus,
	QueryResult
} from "../../control-flow.ts";
import {Observable} from "rxjs";
import {
	DatabaseChangeEvent,
	DatabaseLockEvent,
	DatabaseUnlockEvent,
	EventTypes
} from "../events/events.ts";
import {IDBPDatabase, openDB} from "idb";
import {Logger} from "../../../utils/logger.ts";
import {HEADBASE_INDEXDB_DATABASE_VERSION, HEADBASE_VERSION} from "../../headbase-web.ts";
import {KeyStorageService} from "../key-storage.service.ts";
import {EncryptionService} from "../encryption/encryption.ts"
import {
	CreateDatabaseDto,
	LocalDatabaseDto,
	LocalDatabaseEntity,
	UpdateDatabaseDto
} from "../../schemas/database.ts";
import {DeviceContext, IEventsService} from "../database/interfaces.ts";

export interface DatabasesManagementAPIConfig {
	context: DeviceContext
}

// todo: define somewhere else?
type AnyDatabaseEvent =
	CustomEvent<DatabaseChangeEvent['detail']> |
	CustomEvent<DatabaseUnlockEvent['detail']> |
	CustomEvent<DatabaseLockEvent['detail']>


export class DatabasesManagementAPI {
	private readonly context: DeviceContext
	private appStorageDatabase?: IDBPDatabase

	constructor(
		config: DatabasesManagementAPIConfig,
		private eventsService: IEventsService
	) {
		this.context = config.context
	}

	private async getAppStorageDatabase() {
		if (this.appStorageDatabase) {
			return this.appStorageDatabase
		}

		this.appStorageDatabase = await openDB('headbase', HEADBASE_INDEXDB_DATABASE_VERSION, {
			// todo: handle upgrades to existing database versions
			upgrade: (db) => {
				// Create database store
				const entityStore = db.createObjectStore('databases', {
					keyPath: 'id',
					autoIncrement: false
				})
				entityStore.createIndex('createdAt', ['createdAt', 'isDeleted'])
				entityStore.createIndex('syncEnabled', ['syncEnabled', 'isDeleted'])
			},
		})

		return this.appStorageDatabase
	}

	private async _createDto(entity: LocalDatabaseEntity): Promise<LocalDatabaseDto> {
		const encryptionKey = await KeyStorageService.get(entity.id)

		return {
			...entity,
			isUnlocked: typeof encryptionKey === 'string'
		}
	}

	async unlock(id: string, password: string): Promise<void> {
		const database = await this.get(id)

		let encryptionKey
		try {
			encryptionKey = await EncryptionService.decryptProtectedEncryptionKey(database.protectedEncryptionKey, password)
		}
		catch (e) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_PASSWORD_OR_KEY, originalError: e})
		}

		await KeyStorageService.set(database.id, encryptionKey)
		this.eventsService.dispatch(EventTypes.DATABASE_UNLOCK, {
			context: this.context,
			data: {
				id
			}
		})
	}

	async lock(id: string): Promise<void> {
		await KeyStorageService.delete(id)
		this.eventsService.dispatch(EventTypes.DATABASE_LOCK, {
			context: this.context,
			data: {
				id
			}
		})
	}

	async changePassword(databaseId: string, currentPassword: string, newPassword: string) {
		const currentDatabase = await this.get(databaseId)

		const { protectedEncryptionKey } = await EncryptionService.updateProtectedEncryptionKey(
			currentDatabase.protectedEncryptionKey,
			currentPassword,
			newPassword
		)

		const timestamp = new Date().toISOString();

		const db = await this.getAppStorageDatabase()
		const tx = db.transaction(['databases'], 'readwrite')

		const newDatabase: LocalDatabaseEntity = {
			...currentDatabase,
			protectedEncryptionKey: protectedEncryptionKey,
			updatedAt: timestamp
		}
		await tx.objectStore('databases').put(newDatabase)

		await tx.done

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.context,
			data: {
				id: databaseId,
				action: 'change-password',
			}
		})

		return {success: true, data: null}
	}

	/**
	 * Get a single database
	 *
	 * @param id
	 */
	async get(id: string): Promise<LocalDatabaseDto> {
		const db = await this.getAppStorageDatabase()
		const tx = db.transaction(['databases'], 'readonly')
		const entity = await tx.objectStore('databases').get(id) as LocalDatabaseEntity|undefined
		if (!entity) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND, devMessage: `${id} not found`})
		}
		await tx.done

		return await this._createDto(entity)
	}

	liveGet(id: string) {
		return new Observable<LiveQueryResult<LocalDatabaseDto>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				subscriber.next(LIVE_QUERY_LOADING_STATE)

				try {
					const database = await this.get(id)
					subscriber.next({status: LiveQueryStatus.SUCCESS, result: database})
				}
				catch (e) {
					subscriber.next({status: LiveQueryStatus.ERROR, errors: [e]})
				}
			}

			const handleEvent = (e: AnyDatabaseEvent) => {
				// Discard if tableKey or ID doesn't match, as the data won't have changed.
				if (e.detail.data.id === id && e.detail.data.id === id) {
					Logger.debug(`[observableGet] Received event that requires re-query`)
					runQuery()
				}
			}

			this.eventsService.subscribe(EventTypes.DATABASE_CHANGE, handleEvent)
			this.eventsService.subscribe(EventTypes.DATABASE_UNLOCK, handleEvent)
			this.eventsService.subscribe(EventTypes.DATABASE_LOCK, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.eventsService.unsubscribe(EventTypes.DATABASE_CHANGE, handleEvent)
				this.eventsService.unsubscribe(EventTypes.DATABASE_UNLOCK, handleEvent)
				this.eventsService.unsubscribe(EventTypes.DATABASE_LOCK, handleEvent)
			}
		})
	}

	/**
	 * Create a new database.
	 *
	 * @param createDatabaseDto
	 */
	async create(createDatabaseDto: CreateDatabaseDto): Promise<string> {
		const db = await this.getAppStorageDatabase()

		const id = EncryptionService.generateUUID();
		const timestamp = new Date().toISOString();

		const {protectedEncryptionKey, encryptionKey} = await EncryptionService.createProtectedEncryptionKey(createDatabaseDto.password)
		await KeyStorageService.set(id, encryptionKey)

		const tx = db.transaction(['databases'], 'readwrite')

		const database: LocalDatabaseEntity = {
			id: id,
			name: createDatabaseDto.name,
			protectedEncryptionKey,
			protectedData: undefined,
			createdAt: timestamp,
			updatedAt: timestamp,
			syncEnabled: createDatabaseDto.syncEnabled,
			lastSyncedAt: undefined,
			headbaseVersion: HEADBASE_VERSION
		}
		await tx.objectStore('databases').add(database)

		await tx.done

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.context,
			data: {
				id,
				action: 'create',
			}
		})

		return id
	}

	/**
	 * Update the given entity.
	 * This will load the latest version, apply the given updates, and create a
	 * new version with the updates.
	 *
	 * @param id
	 * @param dataUpdate
	 * @param preventEventDispatch - Useful in situations like data migrations, where an update is done while fetching data so an event shouldn't be triggered.
	 */
	async update(id: string, dataUpdate: UpdateDatabaseDto, preventEventDispatch?: boolean): Promise<void> {
		const currentDb = await this.get(id)

		const timestamp = new Date().toISOString();

		const db = await this.getAppStorageDatabase()
		const tx = db.transaction(['databases'], 'readwrite')

		const newDatabase: LocalDatabaseDto = {
			id: currentDb.id,
			protectedEncryptionKey: currentDb.protectedEncryptionKey,
			protectedData: currentDb.protectedData,
			createdAt: currentDb.createdAt,
			updatedAt: timestamp,
			isUnlocked: currentDb.isUnlocked,
			lastSyncedAt: currentDb.lastSyncedAt,
			name: dataUpdate.name || currentDb.name,
			syncEnabled: dataUpdate.syncEnabled !== undefined
				? dataUpdate.syncEnabled
				: currentDb.syncEnabled,
			headbaseVersion: currentDb.headbaseVersion,
		}
		await tx.objectStore('databases').put(newDatabase)

		await tx.done

		if (!preventEventDispatch) {
			this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
				context: this.context,
				data: {
					id,
					action: 'update',
				}
			})
		}
	}

	/**
	 * Delete the given database.
	 */
	async delete(id: string): Promise<void> {
		// No need to actually access the db, but check it does exist.
		await this.get(id)

		const db = await this.getAppStorageDatabase()
		const tx = db.transaction(['databases'], 'readwrite')
		const entityStore = tx.objectStore('databases')

		// The keypath 'id' is supplied, so no need to also supply this in the second arg
		await entityStore.delete(id)
		await tx.done

		// todo: delete sqlite database from OPFS?

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.context,
			data: {
				id,
				action: 'delete',
			}
		})
	}

	/**
	 * Query for all databases.
	 */
	async query(): Promise<QueryResult<LocalDatabaseDto[]>> {
		const db = await this.getAppStorageDatabase()
		const tx = db.transaction(['databases'], 'readonly')
		const queryIndex = tx.objectStore('databases')

		const cursorResults: LocalDatabaseEntity[] = []
		for await (const entityCursor of queryIndex.iterate()) {
			const entity = entityCursor.value as LocalDatabaseEntity
			cursorResults.push(entity)
		}
		await tx.done

		const dtos: LocalDatabaseDto[] = []
		for (const entity of cursorResults) {
			const dto = await this._createDto(entity)
			dtos.push(dto)
		}

		return {
			result: dtos,
		}
	}

	liveQuery() {
		return new Observable<LiveQueryResult<LocalDatabaseDto[]>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				subscriber.next(LIVE_QUERY_LOADING_STATE)

				try {
					const query = await this.query()
					subscriber.next({status: LiveQueryStatus.SUCCESS, result: query.result, errors: query.errors})
				}
				catch (e) {
					subscriber.next({status: LiveQueryStatus.ERROR, errors: [e]})
				}
			}

			const handleEvent = () => {
				runQuery()
			}

			this.eventsService.subscribe(EventTypes.DATABASE_CHANGE, handleEvent)
			this.eventsService.subscribe(EventTypes.DATABASE_UNLOCK, handleEvent)
			this.eventsService.subscribe(EventTypes.DATABASE_LOCK, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.eventsService.unsubscribe(EventTypes.DATABASE_CHANGE, handleEvent)
				this.eventsService.unsubscribe(EventTypes.DATABASE_UNLOCK, handleEvent)
				this.eventsService.unsubscribe(EventTypes.DATABASE_LOCK, handleEvent)
			}
		})
	}
}
