import {
	ErrorTypes,
	LIVE_QUERY_LOADING_STATE,
	LiveQueryResult,
	LiveQueryStatus,
	HeadbaseError,
	QueryResult
} from "../control-flow";
import {HeadbaseEncryption} from "../encryption/encryption";
import {Observable} from "rxjs";
import {
	DatabaseChangeEvent,
	DatabaseLockEvent,
	DatabaseUnlockEvent,
	EventTypes
} from "../events/events";
import {IDBPDatabase, openDB} from "idb";
import {Logger} from "../../src/utils/logger";
import {LOCALFUL_INDEXDB_DATABASE_VERSION, LOCALFUL_VERSION} from "../headbase-web";
import {LocalDatabaseDto, LocalDatabaseEntity, LocalDatabaseFields} from "../types/database";
import {EventManager} from "../events/event-manager";
import {KeyStorage} from "../storage/key-storage";

export interface DatabaseStorageDependencies {
	eventManager: EventManager
}

type AnyDatabaseEvent =
	CustomEvent<DatabaseChangeEvent['detail']> |
	CustomEvent<DatabaseUnlockEvent['detail']> |
	CustomEvent<DatabaseLockEvent['detail']>

export class DatabaseStorage {
	private _database?: IDBPDatabase
	private readonly eventManager: EventManager

	constructor(
		deps: DatabaseStorageDependencies
	) {
		this.eventManager = deps.eventManager
	}

	private _getIndexDbKey(databaseId: string) {
		return `lf_${databaseId}`
	}

	private async getIndexDbDatabase() {
		if (this._database) {
			return this._database
		}

		this._database = await openDB('headbase', LOCALFUL_INDEXDB_DATABASE_VERSION, {
			// todo: handle upgrades to existing database versions
			upgrade: (db) => {
				// Create database store
				const entityStore = db.createObjectStore('databases', {
					keyPath: 'id',
					autoIncrement: false
				})
				entityStore.createIndex('isDeleted', 'isDeleted')
				entityStore.createIndex('createdAt', ['createdAt', 'isDeleted'])
				entityStore.createIndex('syncEnabled', ['syncEnabled', 'isDeleted'])
			},
		})
		return this._database
	}

	private async _createDto(entity: LocalDatabaseEntity): Promise<LocalDatabaseDto> {
		const encryptionKey = await KeyStorage.get(entity.id)

		return {
			...entity,
			isUnlocked: typeof encryptionKey === 'string'
		}
	}

	async unlockDatabase(id: string, password: string): Promise<void> {
		const database = await this.get(id)

		let encryptionKey
		try {
			encryptionKey = await HeadbaseEncryption.decryptProtectedEncryptionKey(database.protectedEncryptionKey, password)
		}
		catch (e) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_PASSWORD_OR_KEY, originalError: e})
		}

		await KeyStorage.set(database.id, encryptionKey)
		this.eventManager.dispatch( EventTypes.DATABASE_UNLOCK, { id: id })
	}

	async lockDatabase(id: string): Promise<void> {
		await KeyStorage.delete(id)
		this.eventManager.dispatch( EventTypes.DATABASE_LOCK, { id: id })
	}

	async changeDatabasePassword(databaseId: string, currentPassword: string, newPassword: string) {
		const currentDatabase = await this.get(databaseId)

		const { protectedEncryptionKey } = await HeadbaseEncryption.updateProtectedEncryptionKey(
			currentDatabase.protectedEncryptionKey,
			currentPassword,
			newPassword
		)

		const timestamp = new Date().toISOString();

		const db = await this.getIndexDbDatabase()
		const tx = db.transaction(['databases'], 'readwrite')

		const newDatabase: LocalDatabaseEntity = {
			...currentDatabase,
			protectedEncryptionKey: protectedEncryptionKey,
			updatedAt: timestamp
		}
		await tx.objectStore('databases').put(newDatabase)

		await tx.done

		this.eventManager.dispatch( EventTypes.DATABASE_CHANGE, { id: databaseId, action: 'change-password' })

		return {success: true, data: null}
	}

	/**
	 * Get a single database
	 *
	 * @param id
	 */
	async get(id: string): Promise<LocalDatabaseDto> {
		const db = await this.getIndexDbDatabase()
		const tx = db.transaction(['databases'], 'readonly')
		const entity = await tx.objectStore('databases').get(id) as LocalDatabaseEntity|undefined
		if (!entity || entity.isDeleted === 1) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND, devMessage: `${id} not found`})
		}
		await tx.done

		return await this._createDto(entity)
	}

	/**
	 * Create a new database.
	 *
	 * @param data
	 * @param password
	 */
	async create(data: LocalDatabaseFields, password: string): Promise<string> {
		const db = await this.getIndexDbDatabase()

		const id = HeadbaseEncryption.generateUUID();
		const timestamp = new Date().toISOString();

		const {protectedEncryptionKey, encryptionKey} = await HeadbaseEncryption.createProtectedEncryptionKey(password)
		await KeyStorage.set(id, encryptionKey)

		const tx = db.transaction(['databases'], 'readwrite')

		const database: LocalDatabaseEntity = {
			id: id,
			name: data.name,
			protectedEncryptionKey,
			protectedData: undefined,
			createdAt: timestamp,
			updatedAt: timestamp,
			isDeleted: 0,
			headbaseVersion: LOCALFUL_VERSION,
			syncEnabled: data.syncEnabled,
			lastSyncedAt: undefined
		}
		await tx.objectStore('databases').add(database)

		await tx.done

		this.eventManager.dispatch( EventTypes.DATABASE_CHANGE, { id: id, action: 'create'})

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
	async update(id: string, dataUpdate: Partial<LocalDatabaseFields>, preventEventDispatch?: boolean): Promise<void> {
		const currentDb = await this.get(id)

		const timestamp = new Date().toISOString();

		const db = await this.getIndexDbDatabase()
		const tx = db.transaction(['databases'], 'readwrite')

		const newDatabase: LocalDatabaseEntity = {
			id: currentDb.id,
			protectedEncryptionKey: currentDb.protectedEncryptionKey,
			protectedData: currentDb.protectedData,
			createdAt: currentDb.createdAt,
			updatedAt: timestamp,
			isDeleted: currentDb.isDeleted,
			headbaseVersion: currentDb.headbaseVersion,
			lastSyncedAt: currentDb.lastSyncedAt,
			name: dataUpdate.name || currentDb.name,
			syncEnabled: dataUpdate.syncEnabled !== undefined
				? dataUpdate.syncEnabled
				: currentDb.syncEnabled,
		}
		await tx.objectStore('databases').put(newDatabase)

		await tx.done

		if (!preventEventDispatch) {
			this.eventManager.dispatch( EventTypes.DATABASE_CHANGE, { id: id, action: 'update' })
		}
	}

	/**
	 * Delete the given database on the local device and server, setting the 'isDeleted' flag
	 */
	async delete(id: string): Promise<void> {
		const currentDatabase = await this.get(id)

		const timestamp = new Date().toISOString();

		const db = await this.getIndexDbDatabase()
		const tx = db.transaction(['databases'], 'readwrite')
		const entityStore = tx.objectStore('databases')

		const newDatabase: LocalDatabaseEntity = {
			...currentDatabase,
			updatedAt: timestamp,
			isDeleted: 1,
		}

		// The keypath 'id' is supplied, so no need to also supply this in the second arg
		await entityStore.put(newDatabase)

		await tx.done

		indexedDB.deleteDatabase(this._getIndexDbKey(id))

		this.eventManager.dispatch( EventTypes.DATABASE_CHANGE, { id: id, action: 'delete' })
	}

	/**
	 * Delete the database locally but not on the server
	 *
	 * @param id
	 */
	async deleteLocal(id: string): Promise<void> {
		// We don't need to actually use the currentDatabase, but check it does exist.
		await this.get(id)

		const db = await this.getIndexDbDatabase()
		const tx = db.transaction(['databases'], 'readwrite')
		const entityStore = tx.objectStore('databases')

		await entityStore.delete(id)

		indexedDB.deleteDatabase(this._getIndexDbKey(id))
	}

	/**
	 * Query for all databases.
	 */
	async query(): Promise<QueryResult<LocalDatabaseDto[]>> {
		const db = await this.getIndexDbDatabase()
		const tx = db.transaction(['databases'], 'readonly')

		const queryIndex = tx.objectStore('databases').index('isDeleted')

		const cursorResults: LocalDatabaseEntity[] = []
		for await (const entityCursor of queryIndex.iterate(0)) {
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

			this.eventManager.subscribe(EventTypes.DATABASE_CHANGE, handleEvent)
			this.eventManager.subscribe(EventTypes.DATABASE_UNLOCK, handleEvent)
			this.eventManager.subscribe(EventTypes.DATABASE_LOCK, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.eventManager.unsubscribe(EventTypes.DATABASE_CHANGE, handleEvent)
				this.eventManager.unsubscribe(EventTypes.DATABASE_UNLOCK, handleEvent)
				this.eventManager.unsubscribe(EventTypes.DATABASE_LOCK, handleEvent)
			}
		})
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

			this.eventManager.subscribe(EventTypes.DATABASE_CHANGE, handleEvent)
			this.eventManager.subscribe(EventTypes.DATABASE_UNLOCK, handleEvent)
			this.eventManager.subscribe(EventTypes.DATABASE_LOCK, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.eventManager.unsubscribe(EventTypes.DATABASE_CHANGE, handleEvent)
				this.eventManager.unsubscribe(EventTypes.DATABASE_UNLOCK, handleEvent)
				this.eventManager.unsubscribe(EventTypes.DATABASE_LOCK, handleEvent)
			}
		})
	}
}
