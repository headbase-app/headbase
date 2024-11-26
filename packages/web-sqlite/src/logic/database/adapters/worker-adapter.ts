import type {AdapterOptions, DatabaseAdapter, SqlQueryResponse} from "./adapter.d.ts";
import WorkerService from "./sqlite.worker.ts?worker"
import {AdapterEvents, QueryResponseEvent, WorkerEvents} from "./events.ts";


export class WorkerAdapter implements DatabaseAdapter {
	readonly #contextId: string
	readonly #databaseId: string
	readonly #databaseLockAbort: AbortController
	readonly #worker: Worker

	constructor(options: AdapterOptions) {
		this.#contextId = options.contextId
		this.#databaseId = options.databaseId

		this.#worker = new WorkerService();

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

	async init(): Promise<void> {
		await this.#sendWorkerRequest({
			type: 'open',
			messageId: self.crypto.randomUUID(),
			detail: {
				databaseId: this.#databaseId,
				contextId: this.#contextId,
				encryptionKey: 'thisisanamazingkey'
			}} as AdapterEvents)
	}

	async close(): Promise<void> {
		console.debug('close')

		await this.#sendWorkerRequest({
			type: 'close',
			messageId: self.crypto.randomUUID(),
			detail: {
				contextId: this.#contextId,
				databaseId: this.#databaseId,
			}
		})

		this.#worker.terminate()
		this.#databaseLockAbort.abort()
	}

	async run(sql: string, params: any[]): Promise<SqlQueryResponse> {
		const workerResponse = await this.#sendWorkerRequest<QueryResponseEvent>({
			type: 'query',
			messageId: self.crypto.randomUUID(),
			detail: {
				databaseId: this.#databaseId,
				contextId: this.#contextId,
				sql,
				params
			}
		})

		console.debug(workerResponse)

		if (!workerResponse.detail.success) {
			throw new Error(workerResponse.detail.error)
		}

		return workerResponse.detail.result
	}

	/**
	 * A promise wrapper around the worker to allow a request/response pattern.
	 * This uses the 'messageId' sent with client events and 'targetMessageId' received with worker events to match up the request/response.
	 * The promise will resolve with the 'returnValue' of the worker response and wil reject after a given timeout (default is 5 seconds).
	 *
	 * todo: wrapper should convert error events into promise rejections?
	 *
	 * @param message
	 * @param options
	 * @private
	 */
	#sendWorkerRequest<Response extends WorkerEvents>(message: AdapterEvents, options?: {timeout: number}): Promise<Response> {
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

			responseListener = (event: MessageEvent<WorkerEvents>) => {
				console.debug('received event while awaiting response')
				console.debug(event)
				if (event.data.targetMessageId === message.messageId) {
					this.#worker.removeEventListener('message', responseListener)
					timeoutSignal.removeEventListener('abort', abortListener)
					return resolve(event.data as Response)
				}
			}
			this.#worker.addEventListener('message', responseListener)

			console.debug('sent')
			console.debug(message)
			this.#worker.postMessage(message)
		})
	}
}
