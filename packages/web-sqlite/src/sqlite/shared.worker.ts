import {Database} from './database'

export type PortStore = Map<string, MessagePort>
export type DatabaseLockStore = Map<string, string>
export type DatabaseInstanceStore = Map<string, Database>


class BackgroundService {
	#contextId: string
	#portStore: PortStore
	#databaseLockStore: DatabaseLockStore
	#instanceStore: DatabaseInstanceStore

	constructor() {
		this.#contextId = self.crypto.randomUUID()
		this.#portStore = new Map();
		this.#databaseLockStore = new Map();
		this.#instanceStore = new Map();
	}

	handleConnection(message: MessageEvent) {
		const port = message.ports[0]
		port.onmessage = this.handleMessage
	}

	handleMessage(message: MessageEvent) {
		const port = message.ports[0]

		if (message.data.type === 'database-init') {
			console.debug(`[shared-worker] received 'database-init' of '${message.data.detail.databaseId}' from '${message.data.detail.contextId}'`)
			this.#portStore[message.data.detail.contextId] = port
		}
		else if (message.data.type === 'database-lock') {
			console.debug(`[shared-worker] received 'database-lock' of '${message.data.detail.databaseId}' from '${message.data.detail.contextId}'`)
			this.#databaseLockStore[message.data.detail.databaseId] = message.data.detail.contextId
		}
		else if (message.data.type === 'worker-tag-create') {
			console.debug(`[shared-worker] received 'database-lock' of '${message.data.detail.databaseId}' from '${message.data.detail.contextId}'`)

			const currentContextId = this.#databaseLockStore[message.data.detail.databaseId]
			if (!currentContextId) {
				return port.postMessage({type: 'error', detail: {message: `Attempted to emit 'send-tag-create' for database '${message.data.detail.databaseId}' but no lock was found`}})
			}

			const currentContextPort = this.#portStore[currentContextId]
			if (!currentContextPort) {
				return port.postMessage({type: 'error', detail: {message: `Attempted to emit 'send-tag-create' for database '${message.data.detail.databaseId}' using lock context '${currentContextId}' but no port was found`}})
			}

			currentContextPort.postMessage(message.data)
		}

		console.debug('[shared-worker] sending ack event')
		port.postMessage({type: 'ack'})
	}
}

(function (self: SharedWorkerGlobalScope) {
	console.debug('[shared-worker] init background service')
	const backgroundService = new BackgroundService()
	self.onconnect = (m) => {backgroundService.handleConnection(m)}
})(self as unknown as SharedWorkerGlobalScope);
