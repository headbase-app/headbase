import {EntityDatabase, EntityDatabaseConfig} from "./storage/entity-database/entity-database";
import { EventManager } from "./events/event-manager";
import {TableSchemaDefinitions, TableTypeDefinitions} from "./storage/types/types";
import {LocalDatabaseFields} from './types/database'
import {DatabaseStorage} from "./storage/databases";
import {KeyStorage} from "./storage/key-storage";
import {AnyLocalfulEvent, EventTypes, LocalfulEvent} from "./events/events";
import {Observable} from "rxjs";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "./control-flow";
import SharedNetworkWorker from "./worker/shared-worker?sharedworker";
import {Logger} from "../src/utils/logger";
import {ServerHTTPClient} from "./network/http-client";
import {LoginRequest} from "@headbase-app/common";
import z from "zod";
import {GeneralStorage, LocalUserDto} from "./storage/general-storage";

export const LOCALFUL_VERSION = '1.0'
export const LOCALFUL_INDEXDB_ENTITY_VERSION = 1
export const LOCALFUL_INDEXDB_DATABASE_VERSION = 1

// todo: define somewhere else
export const LocalLoginRequest = LoginRequest.extend({
	serverUrl: z.string().url("must be a valid URL")
})
export type LocalLoginRequest = z.infer<typeof LocalLoginRequest>

export interface LocalfulWebConfig<
	TableTypes extends TableTypeDefinitions,
> {
	tableSchemas: EntityDatabaseConfig<TableTypes>['tableSchemas']
}

export type SyncStatus = 'synced' | 'queued' | 'running' | 'error' | 'disabled'

export class LocalfulWeb<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>
> {
	private readonly tableSchemas: TableSchemaDefinitions<TableTypes>
	private readonly databaseStorage: DatabaseStorage

	private readonly generalStorage: GeneralStorage

	private readonly eventManager: EventManager
	private readonly sharedNetworkWorker: SharedWorker

	/**
	 * Synchronisation is managed by the SharedNetworkWorker which then dispatches messages when the sync status
	 * changes or a sync message occurs.
	 */
	private readonly lastKnownSyncStatus: SyncStatus
	private readonly syncMessages: string[]

	constructor(config: LocalfulWebConfig<TableTypes>) {
		this.eventManager = new EventManager()
		this.sharedNetworkWorker = new SharedNetworkWorker()
		this.sharedNetworkWorker.port.start()

		this.tableSchemas = config.tableSchemas
		this.databaseStorage = new DatabaseStorage({eventManager: this.eventManager})
		this.generalStorage = new GeneralStorage()

		// Set up a listener to relay all messages from the shared worker to the event manager.
		this.sharedNetworkWorker.addEventListener('message', this.handleSharedWorkerMessage)

		// Set up a listener to relay all messages from the event manager to the shared worker.
		this.eventManager.subscribeAll(this.handleEventManagerEvent)

		this.syncMessages = []
		this.lastKnownSyncStatus = 'disabled'
	}

	handleSharedWorkerMessage(event: Event) {
		const message  = event as MessageEvent<LocalfulEvent>
		Logger.debug('[LocalfulWeb] Received shared worker message', message.data)
		this.eventManager.dispatch(message.data.type, message.data.detail.data, message.data.detail.context)
	}

	handleEventManagerEvent(event: CustomEvent<LocalfulEvent>) {
		this.sharedNetworkWorker.port.postMessage({type: event.type , data: event.detail })
	}

	async openDatabase(databaseId: string) {
		// Ensure that the database exists before opening the database.
		await this.getDatabase(databaseId)

		// todo: encryptionKey and database.isUnlocked is separate. could this cause issues as they might get out of sync?
		const encryptionKey = await KeyStorage.get(databaseId)
		if (!encryptionKey) {
			return null
		}

		this.eventManager.dispatch(EventTypes.DATABASE_OPEN, {id: databaseId})

		return new EntityDatabase<TableTypes, TableSchemas>({
			databaseId: databaseId,
			encryptionKey,
			tableSchemas: this.tableSchemas
		}, {
			eventManager: this.eventManager
		})
	}

	createDatabase(data: LocalDatabaseFields, password: string) {
		return this.databaseStorage.create(data, password)
	}

	getDatabase(id: string) {
		return this.databaseStorage.get(id)
	}

	updateDatabase(id: string, updatedVault: Partial<LocalDatabaseFields>) {
		return this.databaseStorage.update(id, updatedVault)
	}

	deleteDatabase(id: string) {
		return this.databaseStorage.delete(id)
	}

	deleteLocalDatabase(id: string) {
		return this.databaseStorage.deleteLocal(id)
	}

	queryDatabases() {
		return this.databaseStorage.query()
	}

	liveGetDatabase(id: string) {
		return this.databaseStorage.liveGet(id)
	}

	liveQueryDatabase() {
		return this.databaseStorage.liveQuery()
	}

	unlockDatabase(id: string, password: string) {
		return this.databaseStorage.unlockDatabase(id, password)
	}

	lockDatabase(id: string) {
		return this.databaseStorage.lockDatabase(id)
	}

	changeDatabasePassword(databaseId: string, currentPassword: string, newPassword: string) {
		return this.databaseStorage.changeDatabasePassword(databaseId, currentPassword, newPassword)
	}

	getStoragePermission(): Promise<boolean> {
		return navigator.storage.persisted()
	}

	liveGetStoragePermission(): Observable<LiveQueryResult<boolean>> {
		return new Observable<LiveQueryResult<boolean>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				subscriber.next(LIVE_QUERY_LOADING_STATE)

				try {
					const isGranted = await this.getStoragePermission()
					subscriber.next({status: LiveQueryStatus.SUCCESS, result: isGranted})
				}
				catch (e) {
					subscriber.next({status: LiveQueryStatus.ERROR, errors: [e]})
				}
			}

			const handleEvent = () => {
				runQuery()
			}

			this.eventManager.subscribe(EventTypes.STORAGE_PERMISSION, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.eventManager.unsubscribe(EventTypes.STORAGE_PERMISSION, handleEvent)
			}
		})
	}

	async requestStoragePermissions() {
		const result = await navigator.storage.persist()
		this.eventManager.dispatch('storage-permission', {isGranted: result})
	}

	async login(loginDetails: LocalLoginRequest) {
		const httpClient = new ServerHTTPClient({
			serverUrl: loginDetails.serverUrl,
			generalStorage: this.generalStorage
		})

		const result = await httpClient.login({ email: loginDetails.email, password: loginDetails.password })

		await this.generalStorage.saveCurrentUser({
			...result.user,
			serverUrl: loginDetails.serverUrl,
		})

		this.eventManager.dispatch('user-login', {
			serverUrl: loginDetails.serverUrl,
			user: result.user
		})
	}

	async logout() {
		const localUser = await this.generalStorage.loadCurrentUser()
		if (!localUser) {
			throw new Error('No local user found')
		}

		const httpClient = new ServerHTTPClient({
			serverUrl: localUser.serverUrl,
			generalStorage: this.generalStorage
		})
		await httpClient.logout()
		await this.generalStorage.deleteCurrentUser()

		// todo: allow event to have no data
		this.eventManager.dispatch('user-logout', {})
	}

	getCurrentUser(): Promise<LocalUserDto|null> {
		return this.generalStorage.loadCurrentUser()
	}
	liveGetCurrentUser() {
		return new Observable<LiveQueryResult<LocalUserDto|null>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				subscriber.next(LIVE_QUERY_LOADING_STATE)

				try {
					const user = await this.getCurrentUser()
					subscriber.next({status: LiveQueryStatus.SUCCESS, result: user})
				}
				catch (e) {
					subscriber.next({status: LiveQueryStatus.ERROR, errors: [e]})
				}
			}

			const handleEvent = (e: AnyLocalfulEvent) => {
				if (e.type === EventTypes.USER_LOGIN || e.type === EventTypes.USER_LOGOUT) {
					runQuery()
				}
			}

			this.eventManager.subscribe(EventTypes.USER_LOGIN, handleEvent)
			this.eventManager.subscribe(EventTypes.USER_LOGOUT, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.eventManager.unsubscribe(EventTypes.USER_LOGIN, handleEvent)
				this.eventManager.unsubscribe(EventTypes.USER_LOGOUT, handleEvent)
			}
		})
	}

	close() {
		this.eventManager.unsubscribeAll(this.handleEventManagerEvent)
		this.sharedNetworkWorker.removeEventListener('message', this.handleSharedWorkerMessage)

		this.eventManager.close()
		this.sharedNetworkWorker.port.close()
	}
}
