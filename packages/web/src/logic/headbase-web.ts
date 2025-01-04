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

export const HEADBASE_VERSION = '1.0'
export const HEADBASE_INDEXDB_DATABASE_VERSION = 1

export class HeadbaseWeb {
	private readonly context: DeviceContext
	private readonly generalStorageService: GeneralStorageService
	private readonly databaseService: WebDatabaseService
	private readonly eventsService: WebEventsService

	readonly db: DatabaseTransactions
	readonly databases: DatabasesManagementAPI
	readonly server: ServerAPI

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
		
		this.logMessages = []
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

	async close() {
		await this.eventsService.destroy()
		await this.databaseService.destroy()
		// todo: any clean up needed for db transactions class or server?
	}
}
