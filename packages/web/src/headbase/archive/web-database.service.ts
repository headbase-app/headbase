import {
	IDatabaseService,
	DeviceContext,
	SqlQueryResponse,
	DatabaseServiceConfig, ExecutableData
} from "../interfaces.ts";
import {ClientMessages, QueryResponseMessage, WorkerMessages} from "./sqlite-worker/messages.ts";


/**
 * A database for use within the application web environment.
 * Uses a worker and OPFS for persistence.
 */
export class WebDatabaseService implements IDatabaseService {
	private readonly context: DeviceContext
	private readonly worker: Worker

	constructor(config: DatabaseServiceConfig) {
		this.context = config.context;
		this.worker = new Worker(new URL("./sqlite-worker/sqlite.worker.ts", import.meta.url), {type: 'module'});
	}

	async destroy() {
		this.worker.terminate()
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
	private sendWorkerRequest<Response extends WorkerMessages>(message: ClientMessages, options?: {timeout: number}): Promise<Response> {
		return new Promise((resolve, reject) => {
			// listen for message and resolve when response message is sent.
			// todo: how to handle cleaning up of event listeners?
			// todo: fix eslint and ts-ignore comments

			// eslint-disable-next-line prefer-const
			let responseListener: EventListenerOrEventListenerObject

			const timeoutSignal = AbortSignal.timeout(options?.timeout || 5000)
			const abortListener = () => {
				this.worker.removeEventListener('message', responseListener)
				return reject(new Error(`Timeout while awaiting worker response for message '${message.messageId}'.`))
			}
			timeoutSignal.addEventListener('abort', abortListener)

			// @ts-expect-error -- just allow for now as it appears to work at runtime. todo: fix types
			responseListener = (event: MessageEvent<WorkerEvents>) => {
				if (event.data.targetMessageId === message.messageId) {
					this.worker.removeEventListener('message', responseListener)
					timeoutSignal.removeEventListener('abort', abortListener)
					return resolve(event.data as Response)
				}
			}
			this.worker.addEventListener('message', responseListener)
			this.worker.postMessage(message)
		})
	}

	async open(databaseId: string, encryptionKey: string): Promise<void> {
		await this.sendWorkerRequest({
			type: 'open',
			messageId: self.crypto.randomUUID(),
			detail: {
				databaseId,
				context: this.context,
				encryptionKey: encryptionKey
			}
		})

		// navigator.locks.request(
		// 	`headbase-db-${context.databaseId}`,
		// 	{signal: this.databaseLockAbort.signal}, this.setupDatabaseLock.bind(this)
		// )
	}

	async close(databaseId: string): Promise<void> {
		await this.sendWorkerRequest({
			type: 'close',
			messageId: self.crypto.randomUUID(),
			detail: {
				databaseId,
				context: this.context,
			}
		})

		//this.databaseLockAbort.abort()
	}

	async exec(data: ExecutableData): Promise<SqlQueryResponse> {
		const workerResponse = await this.sendWorkerRequest<QueryResponseMessage>({
			type: 'exec',
			messageId: self.crypto.randomUUID(),
			detail: {
				databaseId: data.databaseId,
				context: this.context,
				sql: data.sql,
				params: data.params,
				rowMode: data.rowMode,
			}
		})

		if (!workerResponse.detail.success) {
			throw new Error(workerResponse.detail.error)
		}

		return workerResponse.detail.result
	}
}
