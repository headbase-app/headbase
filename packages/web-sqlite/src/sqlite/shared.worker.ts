import {Database} from './database'

export type PortStore = Map<string, MessagePort>
export type DatabaseLockStore = Map<string, string>
export type DatabaseInstanceStore = Map<string, Database>

declare const self: SharedWorkerGlobalScope

console.debug('[shared-worker] init background service')

class BackgroundService {
	//@ts-expect-error -- ok that it isn't used yet
	#contextId: string
	readonly #portStore: PortStore
	readonly #databaseLockStore: DatabaseLockStore
	//@ts-expect-error -- ok that it isn't used yet
	#instanceStore: DatabaseInstanceStore

	constructor() {
		this.#contextId = self.crypto.randomUUID()
		this.#portStore = new Map();
		this.#databaseLockStore = new Map();
		this.#instanceStore = new Map();

		self.onconnect = this.handleConnection
	}

	handleConnection(message: MessageEvent) {
		const port = message.ports[0]
		port.onmessage = this.handleMessage
	}

	handleMessage(message: MessageEvent) {
		const port = message.ports[0]

		if (message.data.type === 'database-init') {
			console.debug(`[shared-worker] received 'database-init' of '${message.data.detail.databaseId}' from '${message.data.detail.contextId}'`)
			this.#portStore.set(message.data.detail.contextId, port)
		}
		else if (message.data.type === 'database-lock') {
			console.debug(`[shared-worker] received 'database-lock' of '${message.data.detail.databaseId}' from '${message.data.detail.contextId}'`)
			this.#databaseLockStore.set(message.data.detail.databaseId,  message.data.detail.contextId)
		}
		else if (message.data.type === 'create-field-test') {
			console.debug(`[shared-worker] received 'create-field-test' for database '${message.data.detail.databaseId}' from '${message.data.detail.contextId}'`)

			const currentContextId = this.#databaseLockStore.get(message.data.detail.databaseId)
			if (!currentContextId) {
				return port.postMessage({type: 'error', detail: {message: `Attempted to emit 'send-tag-create' for database '${message.data.detail.databaseId}' but no lock was found`}})
			}

			const currentContextPort = this.#portStore.get(currentContextId)
			if (!currentContextPort) {
				return port.postMessage({type: 'error', detail: {message: `Attempted to emit 'send-tag-create' for database '${message.data.detail.databaseId}' using lock context '${currentContextId}' but no port was found`}})
			}

			currentContextPort.postMessage(message.data)
		}

		console.debug('[shared-worker] sending ack event')
		port.postMessage({type: 'ack'})
	}
}

new BackgroundService()
