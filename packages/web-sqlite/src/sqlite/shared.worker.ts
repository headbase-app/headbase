
export interface PortStore {
	[contextId: string]: MessagePort
}

export interface DatabaseLockStore {
	[databaseId: string]: string
}

const portStore: PortStore = {};
const databaseLockStore: DatabaseLockStore = {};

(function (self: SharedWorkerGlobalScope) {
	self.onconnect = function (event: MessageEvent) {
		const port = event.ports[0]
		console.debug('[shared-worker] connect: ', event);

		port.onmessage = function (e) {
			if (e.data.type === 'database-init') {
				console.debug(`[shared-worker] received 'database-init' of '${e.data.detail.databaseId}' from '${e.data.detail.contextId}'`)
				portStore[e.data.detail.contextId] = port
			}
			else if (e.data.type === 'database-lock') {
				console.debug(`[shared-worker] received 'database-lock' of '${e.data.detail.databaseId}' from '${e.data.detail.contextId}'`)
				databaseLockStore[e.data.detail.databaseId] = e.data.detail.contextId
			}
			else if (e.data.type === 'worker-tag-create') {
				console.debug(`[shared-worker] received 'database-lock' of '${e.data.detail.databaseId}' from '${e.data.detail.contextId}'`)

				const currentContextId = databaseLockStore[e.data.detail.databaseId]
				if (!currentContextId) {
					return port.postMessage({type: 'error', detail: {message: `Attempted to emit 'send-tag-create' for database '${e.data.detail.databaseId}' but no lock was found`}})
				}

				const currentContextPort = portStore[currentContextId]
				if (!currentContextPort) {
					return port.postMessage({type: 'error', detail: {message: `Attempted to emit 'send-tag-create' for database '${e.data.detail.databaseId}' using lock context '${currentContextId}' but no port was found`}})
				}

				currentContextPort.postMessage(e.data)
			}

			console.debug('[shared-worker] sending ack event')
			port.postMessage({type: 'ack'})
		};
	};
})(self as unknown as SharedWorkerGlobalScope);
