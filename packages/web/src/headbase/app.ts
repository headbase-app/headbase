import {Observable} from "rxjs";
import {DeviceContext} from "./interfaces.ts";
import {SyncService} from "./services/sync/sync.service.ts";
import { EventsService } from "./services/events/events.service.ts";
import {KeyValueStoreService} from "./services/key-value-store/key-value-store.service.ts";
import {VaultsService} from "./services/vaults/vaults.service.ts";
import {EncryptionService} from "./services/encryption/encryption.ts";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "./control-flow.ts";
import {EventTypes} from "./services/events/events.ts";
import {ServerService} from "./services/server/server.service.ts";
import {HistoryService} from "./services/history/history.service.ts";
import {FileSystemService} from "./services/file-system/file-system.service.ts";

export const HEADBASE_SPEC_VERSION = 'https://spec.headbase.app/v1'


export class Headbase {
	private readonly context: DeviceContext
	private readonly primaryInstanceLockAbort: AbortController

	readonly events: EventsService
	readonly keyValueStore: KeyValueStoreService

	readonly server: ServerService
	readonly sync: SyncService
	readonly vaults: VaultsService
	readonly history: HistoryService
	readonly fileSystem: FileSystemService

	constructor() {
		this.context = {
			id: EncryptionService.generateUUID()
		}

		this.events = new EventsService({context: this.context})
		this.keyValueStore = new KeyValueStoreService()

		this.server = new ServerService(
			{context: this.context},
			this.events,
			this.keyValueStore
		)

		this.vaults = new VaultsService(
			{context: this.context},
			this.events,
			this.keyValueStore
		)

		this.history = new HistoryService(
			{context: this.context},
			this.events,
			this.keyValueStore
		)

		this.sync = new SyncService(
			{context: this.context},
			this.events,
			this.server,
			this.vaults,
			this.history
		)

		this.fileSystem = new FileSystemService(
			{context: this.context},
			this.events
		)

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

			this.events.subscribe(EventTypes.STORAGE_PERMISSION, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.events.unsubscribe(EventTypes.STORAGE_PERMISSION, handleEvent)
			}
		})
	}

	async requestStoragePermissions() {
		const result = await navigator.storage.persist()
		this.events.dispatch(EventTypes.STORAGE_PERMISSION, {
			context: this.context,
			data: {
				isGranted: result
			}
		})
	}

	async destroy() {
		await this.events.destroy()
		await this.sync.destroy()
		// todo: any clean up needed for db transactions class or server?
	}
}
