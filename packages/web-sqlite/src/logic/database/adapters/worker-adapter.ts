import type {AdapterOptions, DatabaseAdapter, QueryResponse} from "./adapter.d.ts";
import WorkerService from "./sqlite.worker.ts?worker"


export class WorkerAdapter implements DatabaseAdapter {
	readonly #contextId: string
	readonly #databaseId: string
	readonly #databaseLockAbort: AbortController
	readonly #worker: Worker

	constructor(options: AdapterOptions) {
		this.#contextId = options.contextId
		this.#databaseId = options.databaseId

		this.#worker = new WorkerService();
		this.#worker.postMessage({
			type: 'connect',
			detail: {
				databaseId: this.#databaseId,
				contextId: this.#contextId,
		}});

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

		this.#worker.postMessage({
			type: 'sql',
			messageId,
			detail: {
				sql,
				params
			}
		})

		const workerResponse = await this.#sendWorkerRequest<QueryResponse>({
			type: 'sql',
			messageId,
			detail: {
				sql,
				params
			}
		})
		console.debug(`received response for ${messageId}`)
		console.debug(workerResponse)

		return {rows: []}
	}

	/**
	 * A promise wrapper around the worker to allow a request/response pattern.
	 * This uses the 'messageId' sent with client events and 'targetMessageId' received with worker events to match up the request/response.
	 * The promise will resolve with the 'returnValue' of the worker response and wil reject after a given timeout (default is 5 seconds).
	 *
	 * todo: wrapper should convert error events into promise rejections?
	 *
	 * @param message
	 * @private
	 */
	#sendWorkerRequest<T>(message: any, options?: {timeout: number}): Promise<T> {
		return new Promise((resolve, reject) => {
			// listen for message and resolve when response message is sent.
			// todo: how to handle cleaning up of event listeners?

			let responseListener: EventListenerOrEventListenerObject

			const timeoutSignal = AbortSignal.timeout(options?.timeout || 5000)
			const abortListener = () => {
				this.#worker.removeEventListener('message', responseListener)
				return reject(new Error("Timeout while awaiting worker response."))
			}
			timeoutSignal.addEventListener('abort', abortListener)

			responseListener = (event: MessageEvent) => {
				console.debug('received event while awaiting response')
				console.debug(event)
				if (event.data.type === 'response' && event.data.targetMessageId === message.messageId) {
					this.#worker.removeEventListener('message', responseListener)
					timeoutSignal.removeEventListener('abort', abortListener)
					return resolve(event.data.returnValue as T)
				}
			}

			this.#worker.addEventListener('message', responseListener)

			this.#worker.postMessage(message)
		})
	}
}
