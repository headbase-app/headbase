import type {AdapterOptions, DatabaseAdapter, QueryResponse} from "../adapter.d.ts";
import SharedWorkerService from "./shared.worker.ts?sharedworker"


export class WorkerClientAdapter implements DatabaseAdapter {
	readonly #contextId: string
	readonly #databaseId: string
	readonly #databaseFilename: string
	readonly #databaseLockAbort: AbortController
	readonly #sharedWorker: SharedWorker

	constructor(options: AdapterOptions) {
		this.#contextId = options.contextId
		this.#databaseId = options.databaseId
		this.#databaseFilename = `headbase-${this.#databaseId}.sqlite3`;

		this.#sharedWorker = new SharedWorkerService();
		this.#sharedWorker.port.start()

		this.#sharedWorker.port.postMessage(JSON.stringify({type: 'connect', detail: {database: this.#databaseFilename}}));

		this.#databaseLockAbort = new AbortController()
		navigator.locks.request(`headbase-${this.#databaseId}`, {signal: this.#databaseLockAbort.signal}, this.#setupDatabaseLock.bind(this))
	}

	async #setupDatabaseLock(lock: Lock | null) {
		console.debug(`[database] acquired lock on '${lock?.name || this.#databaseId}' using context '${this.#contextId}'`);

		// Indefinitely maintain this lock by returning a promise.
		// When the tab or database class is closed, the lock will be released and then another context can claim the lock if required.
		return new Promise<void>((resolve) => {
			this.#databaseLockAbort.signal.addEventListener('abort', () => {
				console.debug(`[database] aborting lock '${lock?.name || this.#databaseId}' from context '${this.#contextId}'`);
				resolve()
			})
		})
	}

	async close(): Promise<void> {
		console.debug('close')
		this.#databaseLockAbort.abort()
	}

	async run(sql: string, params: any[]): Promise<QueryResponse> {
		// todo: replace with Encryption library
		const messageId = self.crypto.randomUUID()

		// todo: send query to worker

		const workerResponse = await this.#awaitWorkerResponse(messageId)
		return {rows: []}
	}

	#awaitWorkerResponse(messageId: string): any {
		return new Promise((resolve, reject) => {
			// listen for message and resolve when response message is sent.
			// todo: how to handle cleaning up of event listeners?

			let listener: EventListenerOrEventListenerObject
			listener = (event) => {
				console.debug('received event while awaiting response')
				console.debug(event)
				if (event?.detail?.targetMessageId === messageId) {
					this.#sharedWorker.removeEventListener('message', listener)
					resolve(event.detail)
				}
			}
			this.#sharedWorker.addEventListener('message', listener)

			setTimeout(() => {
				reject(new Error("Timeout while waiting for worker response"))
			}, 5000)
		})
	}
}
