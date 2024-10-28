import {Observable} from "rxjs";

import {TransactionsAPIConfig, TransactionsAPI} from "./apis/transactions/transactions";
import { EventsService } from "./services/events/events.service";
import {TableSchemaDefinitions, TableTypeDefinitions} from "./schemas/tables";
import {DatabasesAPI} from "./apis/databases";
import {EventTypes, HeadbaseEvent} from "./services/events/events";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "./control-flow";
import {Logger} from "../src/utils/logger";
import {GeneralStorageService} from "./services/general-storage.service";
import {ServerAPI} from "./apis/server";
import SharedWorkerService from "./services/shared.worker?sharedworker"

export const HEADBASE_VERSION = '1.0'
export const HEADBASE_INDEXDB_ENTITY_VERSION = 1
export const HEADBASE_INDEXDB_DATABASE_VERSION = 1


export interface HeadbaseWebConfig<
	TableTypes extends TableTypeDefinitions,
> {
	tableSchemas: TransactionsAPIConfig<TableTypes>['tableSchemas']
}

export class HeadbaseWeb<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>
> {
	readonly #tableSchemas: TableSchemaDefinitions<TableTypes>
	readonly #eventsService: EventsService
	readonly #generalStorage: GeneralStorageService
	readonly #sharedWorker: SharedWorker

	readonly databases: DatabasesAPI
	readonly tx: TransactionsAPI<TableTypes, TableSchemas>
	readonly server: ServerAPI

	// todo: update on events firing etc
	#logMessages: string[]

	constructor(config: HeadbaseWebConfig<TableTypes>) {
		this.#tableSchemas = config.tableSchemas
		this.#eventsService = new EventsService()
		this.#sharedWorker = new SharedWorkerService()
		this.#generalStorage = new GeneralStorageService()

		this.databases = new DatabasesAPI({eventService: this.#eventsService})
		this.tx = new TransactionsAPI<TableTypes, TableSchemas>(
			{
				tableSchemas: this.#tableSchemas
			},
			{
				eventsService: this.#eventsService,
				databases: this.databases,
			}
		)
		this.server = new ServerAPI({
			generalStorage: this.#generalStorage,
			eventsService: this.#eventsService,
		})

		// Set up a listener to relay all messages from the shared worker to the event manager.
		this.#sharedWorker.port.start()
		this.#sharedWorker.addEventListener('message', this.handleSharedWorkerMessage.bind(this))

		// Set up a listener to relay all messages from the event manager to the shared worker.
		this.#eventsService.subscribeAll(this.handleEventManagerEvent.bind(this))
		
		this.#logMessages = []
	}

	handleSharedWorkerMessage(event: Event) {
		const message  = event as MessageEvent<HeadbaseEvent>
		Logger.debug('[HeadbaseWeb] Received shared worker message', message.data)
		this.#eventsService.dispatch(message.data.type, message.data.detail.data, message.data.detail.context)
	}

	handleEventManagerEvent(event: CustomEvent<HeadbaseEvent>) {
		this.#sharedWorker.port.postMessage({type: event.type , data: event.detail })
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

			this.#eventsService.subscribe(EventTypes.STORAGE_PERMISSION, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.#eventsService.unsubscribe(EventTypes.STORAGE_PERMISSION, handleEvent)
			}
		})
	}

	async requestStoragePermissions() {
		const result = await navigator.storage.persist()
		this.#eventsService.dispatch('storage-permission', {isGranted: result})
	}
	
	async getLogMessages(): Promise<string[]> {
		return this.#logMessages
	}

	close() {
		this.#eventsService.unsubscribeAll(this.handleEventManagerEvent)
		this.#sharedWorker.removeEventListener('message', this.handleSharedWorkerMessage)

		this.#eventsService.close()
		this.#sharedWorker.port.close()
	}
}
