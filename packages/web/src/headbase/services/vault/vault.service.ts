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
	DatabaseChangeEvent, DatabaseLockEvent, DatabaseUnlockEvent,
	EventTypes
} from "../events/events.ts";
import {Logger} from "../../../utils/logger.ts";
import {EncryptionService} from "../encryption/encryption.ts"
import {VaultDto} from "@headbase-app/common";
import {EventsService} from "../events/events.service.ts";
import {SQLocalDrizzle} from "sqlocal/drizzle";
import {drizzle, SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {DeviceContext} from "../../interfaces.ts";
import {CreateVaultDto, LocalVaultDto, LocalVaultEntity, UpdateVaultDto} from "./local-vault.ts";
import {KeyValueStoreService} from "../key-value-store/key-value-store.service.ts";
import {z} from "zod";
import {schema, vaults} from "./schema.ts"
import {eq} from "drizzle-orm";
import {HEADBASE_SPEC_VERSION} from "../../app.ts";

export interface VaultsServiceConfig {
	context: DeviceContext
}

export class VaultsService {
	private readonly context: DeviceContext
	private _db?: SqliteRemoteDatabase<typeof schema>

	constructor(
		config: VaultsServiceConfig,
		private eventsService: EventsService,
		private keyValueStoreService: KeyValueStoreService
	) {
		this.context = config.context
	}

	private async getDatabase(): Promise<SqliteRemoteDatabase<typeof schema>> {
		if (this._db) return this._db;

		const { driver, batchDriver } = new SQLocalDrizzle("/headbase/headbase.sqlite3");
		this._db = drizzle(driver, batchDriver);

		return this._db;
	}

	private async _createDto(entity: LocalVaultEntity): Promise<LocalVaultDto> {
		const encryptionKey = await this.keyValueStoreService.get(entity.id, z.string())

		return {
			...entity,
			isUnlocked: typeof encryptionKey === 'string'
		}
	}

	async unlock(id: string, password: string): Promise<void> {
		const database = await this.get(id)

		let encryptionKey
		try {
			encryptionKey = await EncryptionService.decryptProtectedEncryptionKey(database.encryptionKey, password)
		}
		catch (e) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_PASSWORD_OR_KEY, originalError: e})
		}

		await this.keyValueStoreService.save(database.id, encryptionKey)
		this.eventsService.dispatch(EventTypes.DATABASE_UNLOCK, {
			context: this.context,
			data: {
				id
			}
		})
	}

	async lock(id: string): Promise<void> {
		await this.keyValueStoreService.delete(id)
		this.eventsService.dispatch(EventTypes.DATABASE_LOCK, {
			context: this.context,
			data: {
				id
			}
		})
	}

	async changePassword(vaultId: string, currentPassword: string, newPassword: string) {
		const currentVault = await this.get(vaultId)

		const { protectedEncryptionKey } = await EncryptionService.updateProtectedEncryptionKey(
			currentVault.encryptionKey,
			currentPassword,
			newPassword
		)

		const timestamp = new Date().toISOString();

		const db = await this.getDatabase()
		const newVault: LocalVaultEntity = {
			...currentVault,
			encryptionKey: protectedEncryptionKey,
			updatedAt: timestamp
		}

		await db
			.update(vaults)
			.set(newVault)
			.where(eq(vaults.id, vaultId))

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.context,
			data: {
				id: vaultId,
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
	async get(id: string): Promise<LocalVaultDto> {
		const db = await this.getDatabase()
		const result = await db
			.select()
			.from(vaults)
			.where(eq(vaults.id, id))

		if (!result[0]) {
			throw new HeadbaseError({type: ErrorTypes.NOT_FOUND, devMessage: `database ${id} not found`})
		}
		return await this._createDto(result[0])
	}

	liveGet(id: string) {
		return new Observable<LiveQueryResult<LocalVaultDto>>((subscriber) => {
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

			const handleEvent = (event: DatabaseChangeEvent|DatabaseUnlockEvent|DatabaseLockEvent) => {
				// Discard if tableKey or ID doesn't match, as the data won't have changed.
				if (event.detail.data.id === id && event.detail.data.id === id) {
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
	async create(createDatabaseDto: CreateVaultDto): Promise<string> {
		const db = await this.getDatabase()

		const id = EncryptionService.generateUUID();
		const timestamp = new Date().toISOString();

		const {protectedEncryptionKey, encryptionKey} = await EncryptionService.createProtectedEncryptionKey(createDatabaseDto.password)
		await this.keyValueStoreService.save(id, encryptionKey)

		await db
			.insert(vaults)
			// todo: add ownerId if user is logged in?
			.values({
				id: id,
				name: createDatabaseDto.name,
				encryptionKey: protectedEncryptionKey,
				data: null,
				createdAt: timestamp,
				updatedAt: timestamp,
				syncEnabled: createDatabaseDto.syncEnabled,
				lastSyncedAt: null,
				headbaseVersion: HEADBASE_SPEC_VERSION
			})

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
	 * Insert an existing database (for example, when downloading from server)
	 *
	 * @param vaultDto
	 */
	async insertExisting(vaultDto: VaultDto): Promise<string> {
		const db = await this.getDatabase()

		await db
			.insert(vaults)
			.values({
				ownerId: vaultDto.ownerId,
				id: vaultDto.id,
				name: vaultDto.name,
				encryptionKey: vaultDto.encryptionKey,
				data: vaultDto.data,
				createdAt: vaultDto.createdAt,
				updatedAt: vaultDto.updatedAt,
				syncEnabled: true,
				lastSyncedAt: undefined,
				headbaseVersion: HEADBASE_SPEC_VERSION
			})

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.context,
			data: {
				id: vaultDto.id,
				action: 'create',
			}
		})

		return vaultDto.id
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
	async update(id: string, dataUpdate: UpdateVaultDto, preventEventDispatch?: boolean): Promise<void> {
		const currentDb = await this.get(id)

		const timestamp = new Date().toISOString();

		const db = await this.getDatabase()

		await db
			.update(vaults)
			.set({
				updatedAt: timestamp,
				lastSyncedAt: dataUpdate.lastSyncedAt || currentDb.lastSyncedAt,
				name: dataUpdate.name || currentDb.name,
				syncEnabled: dataUpdate.syncEnabled !== undefined
					? dataUpdate.syncEnabled
					: currentDb.syncEnabled
			})
			.where(eq(vaults.id, id))

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
	 * Replace the given database, useful when updating the
	 *
	 * @param id
	 * @param vault
	 * @param preventEventDispatch - Useful in situations like data migrations, where an update is done while fetching data so an event shouldn't be triggered.
	 */
	async replace(id: string, vault: Omit<LocalVaultDto, 'id'>, preventEventDispatch?: boolean): Promise<void> {
		const db = await this.getDatabase()
		await db
			.update(vaults)
			.set(vault)
			.where(eq(vaults.id, id))

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

		const db = await this.getDatabase()
		await db
			.delete(vaults)
			.where(eq(vaults.id, id))

		// todo: also delete file system items?

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
	async query(): Promise<QueryResult<LocalVaultDto[]>> {
		const db = await this.getDatabase()

		const results = await db
			.select()
			.from(vaults)

		const dtos: LocalVaultDto[] = []
		for (const entity of results) {
			const dto = await this._createDto(entity)
			dtos.push(dto)
		}

		return {
			result: dtos,
		}
	}

	liveQuery() {
		return new Observable<LiveQueryResult<LocalVaultDto[]>>((subscriber) => {
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
