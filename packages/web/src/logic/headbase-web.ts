import {Observable} from "rxjs";

import {DatabasesManagementAPI} from "./services/database-management/database-management.ts";
import {EventTypes} from "./services/events/events";
import {ErrorTypes, HeadbaseError, LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "./control-flow";
import {GeneralStorageService} from "./services/general-storage.service";
import {ServerAPI} from "./services/server/server.ts";
import {WebPlatformAdapter} from "./services/database/web-adapter.ts";
import {DeviceContext} from "../lib/headbase-core/adapter.ts";
import {EncryptionService} from "./services/encryption/encryption.ts";
import {Database} from "../lib/headbase-core/database.ts";
import {KeyStorageService} from "./services/key-storage.service.ts";

export const HEADBASE_VERSION = '1.0'
export const HEADBASE_INDEXDB_ENTITY_VERSION = 1
export const HEADBASE_INDEXDB_DATABASE_VERSION = 1

export class HeadbaseWeb {
	readonly #context: DeviceContext
	readonly #platformAdapter: WebPlatformAdapter
	readonly #generalStorage: GeneralStorageService

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

			this.#platformAdapter.subscribeEvent(EventTypes.STORAGE_PERMISSION, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.#platformAdapter.unsubscribeEvent(EventTypes.STORAGE_PERMISSION, handleEvent)
			}
		})
	}

	async requestStoragePermissions() {
		const result = await navigator.storage.persist()
		this.#platformAdapter.dispatchEvent(EventTypes.STORAGE_PERMISSION, {
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

	async openDatabase(databaseId: string): Promise<Database> {
		const database = await this.databases.get(databaseId)
		const encryptionKey = await KeyStorageService.get(databaseId)

		if (database.isUnlocked) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_PASSWORD_OR_KEY, devMessage: "Database is not unlocked."})
		}

		if (!encryptionKey) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_PASSWORD_OR_KEY, devMessage: "Encryption key not found."})
		}

		return new Database(databaseId, {
			context: this.#context,
			platformAdapter: this.#platformAdapter,
		})
	}
}
