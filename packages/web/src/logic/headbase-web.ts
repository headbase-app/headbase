import {Observable} from "rxjs";

import {DatabasesManagementAPI} from "./services/database-management/database-management.ts";
import {EventTypes} from "./services/events/events";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "./control-flow";
import {GeneralStorageService} from "./services/general-storage/general-storage.service.ts";
import {ServerAPI} from "./services/server/server.ts";
import {WebDatabaseService} from "./services/database/web-database.service.ts";
import {DeviceContext} from "./services/interfaces.ts";
import {EncryptionService} from "./services/encryption/encryption.ts";
import {DatabaseTransactions} from "./services/database/db.ts";
import {WebEventsService} from "./services/events/web-events.service.ts";
import {SyncService} from "./services/sync/sync.service.ts";

export const HEADBASE_VERSION = '1.0'
export const HEADBASE_INDEXDB_DATABASE_VERSION = 1

export class HeadbaseWeb {
	private readonly context: DeviceContext
	private readonly primaryInstanceLockAbort: AbortController

	private readonly generalStorageService: GeneralStorageService
	private readonly databaseService: WebDatabaseService
	private readonly eventsService: WebEventsService

	readonly db: DatabaseTransactions
	readonly databases: DatabasesManagementAPI
	readonly server: ServerAPI
	readonly sync: SyncService

	// todo: update on events firing etc
	private readonly logMessages: string[]

	constructor() {
		this.context = {
			id: EncryptionService.generateUUID()
		}

		this.eventsService = new WebEventsService({context: this.context})
		this.databaseService = new WebDatabaseService({context: this.context})
		window.dbs = this.databaseService

		this.db = new DatabaseTransactions(
			{context: this.context},
			this.eventsService,
			this.databaseService
		)

		this.generalStorageService = new GeneralStorageService()

		this.databases = new DatabasesManagementAPI(
			{context: this.context},
			this.eventsService
		)

		this.server = new ServerAPI(
			{context: this.context},
			this.eventsService,
			this.generalStorageService
		)

		this.sync = new SyncService(
			{context: this.context},
			this.eventsService,
			this.server,
			this.databases,
			this.db
		)
		
		this.logMessages = []

		this.primaryInstanceLockAbort = new AbortController();
		navigator.locks.request(
			`headbase-primary-instance`,
			{signal: this.primaryInstanceLockAbort.signal},
			this.setupPrimaryInstanceLock.bind(this)
		)
	}

	async setupPrimaryInstanceLock() {
		console.debug(`[web] acquired primary instance lock for context '${this.context.id}'`);

		await this.sync.start()

		// Indefinitely maintain this lock by returning a promise.
		// When the browser context is closed, the lock will be released and then another context can claim the lock if required.
		return new Promise<void>((resolve) => {
			this.primaryInstanceLockAbort.signal.addEventListener('abort', async () => {
				console.debug(`[web] aborting primary instance lock for context '${this.context.id}'`);
				await this.sync.end()
				resolve()
			})
		})
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

			this.eventsService.subscribe(EventTypes.STORAGE_PERMISSION, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.eventsService.unsubscribe(EventTypes.STORAGE_PERMISSION, handleEvent)
			}
		})
	}

	async requestStoragePermissions() {
		const result = await navigator.storage.persist()
		this.eventsService.dispatch(EventTypes.STORAGE_PERMISSION, {
			context: this.context,
			data: {
				isGranted: result
			}
		})
	}
	
	async getLogMessages(): Promise<string[]> {
		return this.logMessages
	}

	async destroy() {
		await this.eventsService.destroy()
		await this.databaseService.destroy()
		await this.sync.destroy()
		// todo: any clean up needed for db transactions class or server?
	}
}
