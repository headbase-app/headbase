import {Observable} from "rxjs";

import {DatabasesManagementAPI} from "./services/database-management/database-management.ts";
import {EventTypes} from "./services/events/events";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "./control-flow";
import {GeneralStorageService} from "./services/general-storage.service";
import {ServerAPI} from "./services/server/server.ts";
import {WebPlatformAdapter} from "./services/database/web-adapter/web-adapter.ts";
import {DeviceContext} from "./services/database/adapter.ts";
import {EncryptionService} from "./services/encryption/encryption.ts";
import {Database} from "./services/database/database.ts";

export const HEADBASE_VERSION = '1.0'
export const HEADBASE_INDEXDB_DATABASE_VERSION = 1

export class HeadbaseWeb {
	readonly #context: DeviceContext
	readonly #platformAdapter: WebPlatformAdapter
	readonly #generalStorage: GeneralStorageService

	readonly db: Database
	readonly databases: DatabasesManagementAPI
	readonly server: ServerAPI

	// todo: update on events firing etc
	#logMessages: string[]

	constructor() {
		this.#context = {
			id: EncryptionService.generateUUID()
		}
		this.#platformAdapter = new WebPlatformAdapter({
			context: this.#context
		})
		this.db = new Database({
			context: this.#context,
			platformAdapter: this.#platformAdapter,
		})

		this.#generalStorage = new GeneralStorageService()

		this.databases = new DatabasesManagementAPI({
			context: this.#context,
			platformAdapter: this.#platformAdapter
		})
		this.server = new ServerAPI({
			context: this.#context,
			generalStorage: this.#generalStorage,
			platformAdapter: this.#platformAdapter,
		})
		
		this.#logMessages = []
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

			this.#platformAdapter.events.subscribe(EventTypes.STORAGE_PERMISSION, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.#platformAdapter.events.unsubscribe(EventTypes.STORAGE_PERMISSION, handleEvent)
			}
		})
	}

	async requestStoragePermissions() {
		const result = await navigator.storage.persist()
		this.#platformAdapter.events.dispatch(EventTypes.STORAGE_PERMISSION, {
			context: this.#context,
			data: {
				isGranted: result
			}
		})
	}
	
	async getLogMessages(): Promise<string[]> {
		return this.#logMessages
	}

	async close() {
		await this.#platformAdapter.destroy()
	}
}
