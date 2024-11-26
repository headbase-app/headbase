import {DeviceContext, PlatformAdapter, SqlQueryResponse} from "../adapter.ts";
import WorkerService from "./sqlite.worker.ts?worker"
import {AdapterEvents, QueryResponseEvent, WorkerEvents} from "./messages.ts";
import {EventMap, EventTypes, HeadbaseEvent} from "../../services/events/events.ts";


export class WebPlatformAdapter implements PlatformAdapter {
	// readonly #databaseLockAbort: AbortController
	readonly #worker: Worker
	#eventTarget: EventTarget
	#localBroadcastChannel: BroadcastChannel | undefined

	constructor() {
		this.#worker = new WorkerService();
		// this.#databaseLockAbort = new AbortController()

		// todo: separate broadcast channel for different databases?
		this.#eventTarget = new EventTarget()
		this.#localBroadcastChannel = new BroadcastChannel(`headbase_events`)
		this.#localBroadcastChannel.onmessage = (message: MessageEvent<HeadbaseEvent>) => {
			console.debug('[EventManager] Received broadcast channel message', message.data)
			this.dispatchEvent(message.data.type, message.data.detail.data, message.data.detail.context)
		}
	}

	async init() {
		console.debug('[WebPlatformAdapter] init')
	}

	async destroy() {
		console.debug('[WebPlatformAdapter] destroy')
		this.#worker.terminate()
	}

	// async #setupDatabaseLock(lock: Lock | null) {
	// 	console.debug(`[database] acquired lock on '${lock?.name || this.#databaseId}' using context '${this.#contextId}'`);
	//
	// 	// Indefinitely maintain this lock by returning a promise.
	// 	// When the tab or database class is closed, the lock will be released and then another context can claim the lock if required.
	// 	return new Promise<void>((resolve) => {
	// 		this.#databaseLockAbort.signal.addEventListener('abort', () => {
	// 			console.debug(`[database] aborting lock '${lock?.name || this.#databaseId}' from context '${this.#contextId}'`);
	// 			resolve()
	// 		})
	// 	})
	// }

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
			// todo: fix eslint and ts-ignore comments

			// eslint-disable-next-line prefer-const
			let responseListener: EventListenerOrEventListenerObject

			const timeoutSignal = AbortSignal.timeout(options?.timeout || 5000)
			const abortListener = () => {
				this.#worker.removeEventListener('message', responseListener)
				return reject(new Error("Timeout while awaiting worker response."))
			}
			timeoutSignal.addEventListener('abort', abortListener)

			// @ts-expect-error -- just allow for now as it appears to work at runtime. todo: fix types
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
			this.#worker.postMessage(message)
		})
	}

	async openDatabase(context: DeviceContext): Promise<void> {
		await this.#sendWorkerRequest({
			type: 'open',
			messageId: self.crypto.randomUUID(),
			detail: {
				databaseId: context.databaseId,
				contextId: context.contextId,
				encryptionKey: 'thisisanamazingkey'
			}} as AdapterEvents)

		// navigator.locks.request(
		// 	`headbase-db-${context.databaseId}`,
		// 	{signal: this.#databaseLockAbort.signal}, this.#setupDatabaseLock.bind(this)
		// )
	}

	async closeDatabase(context: DeviceContext): Promise<void> {
		console.debug('close')

		await this.#sendWorkerRequest({
			type: 'close',
			messageId: self.crypto.randomUUID(),
			detail: {
				databaseId: context.databaseId,
				contextId: context.contextId,
			}
		})

		//this.#databaseLockAbort.abort()
	}

	async runSql(context: DeviceContext, sql: string, params: any[]): Promise<SqlQueryResponse> {
		const workerResponse = await this.#sendWorkerRequest<QueryResponseEvent>({
			type: 'query',
			messageId: self.crypto.randomUUID(),
			detail: {
				databaseId: context.databaseId,
				contextId: context.contextId,
				sql,
				params
			}
		})

		if (!workerResponse.detail.success) {
			throw new Error(workerResponse.detail.error)
		}

		return workerResponse.detail.result
	}

	dispatchEvent<Event extends keyof EventMap>(type: Event, data: EventMap[Event]["detail"]["data"], context?: DeviceContext): void {
		const eventDetail = {
			context: context || {contextId: this.contextId},
			data: data,
		}

		console.debug(`[EventManager] Dispatching event:`, type, eventDetail)

		const event = new CustomEvent(type, { detail: eventDetail })
		this.eventTarget.dispatchEvent(event)

		// Only broadcast events to other instances and the shared worker if they originate in the current context,
		// otherwise hello infinite event ping pong!
		if (event.detail.context.contextId === this.) {
			if (this.#localBroadcastChannel) {
				// Don't send open/close events as that is unique to every instance.
				if (type !== EventTypes.DATABASE_OPEN && type !== EventTypes.DATABASE_CLOSE) {
					this.#localBroadcastChannel.postMessage({ type, detail: eventDetail })
				}
			}
		}
	}

	subscribeEvent<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]["detail"]>) => void): void {
		// @ts-expect-error - We can add a callback for custom events!
		this.#eventTarget.addEventListener(type, listener)
	}

	unsubscribeEvent<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]["detail"]>) => void): void {
		// @ts-expect-error - We can add a callback for custom events!
		this.#eventTarget.removeEventListener(type, listener)
	}

	subscribeAllEvents(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {
		for (const event of Object.values(EventTypes)) {
			// @ts-expect-error - We can add a callback for custom events!
			this.#eventTarget.addEventListener(event, listener)
		}
	}

	unsubscribeAllEvents(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {
		for (const event of Object.values(EventTypes)) {
			// @ts-expect-error - We can add a callback for custom events!
			this.#eventTarget.removeEventListener(event, listener)
		}
	}
}
