import {
	type CreateDocumentDto,
	IMatterDatabase,
	type MatterDocument,
	type Query,
	type UpdateDocumentDto, type VersionData,
	EventsService, type IEventsService, type MatterEvent, _MatterObservable
} from "@headbase-app/matter";
import {type DatabaseDto, type IDatabaseSwitcherAPI, LiveQueryStatus} from "@headbase-app/lib";

// todo: share type with worker
export type MatterProxyMessageTypes = {
	type: "init"
} | {
	type: "matter-proxy",
	databasePath: string,
	databaseId: string,
	method:
		'create' |
		'update' |
		'delete' |
		'purge' |
		'get' |
		'query' |
		'_UNSAFE_raw_query' |
		'createVersion' |
		'deleteVersion' |
		'purgeVersion' |
		'getVersion' |
		'queryVersions' |
		'_UNSAFE_raw_queryVersions' |
		'clean'
	params: any[]
}
export type MatterProxyMessage = {mid: string} & MatterProxyMessageTypes

export interface MatterProxyMessageResponse {
	mid: string
	result: unknown
}

export class MatterWebProxy implements IMatterDatabase {
	isActiveProxy: boolean = false;
	private proxyLock: AbortController
	private proxyChannel: BroadcastChannel
	private readonly handleProxyMessageBound: MatterWebProxy['handleProxyMessage']

	events: IEventsService
	private eventsBroadcastChannel?: BroadcastChannel

	rxjs: _MatterObservable

	constructor(
		private worker: Worker,
		private databaseSwitcherAPI: IDatabaseSwitcherAPI
	) {
		this.proxyLock = new AbortController();
		this.proxyChannel = new BroadcastChannel("matter_proxy");

		this.handleProxyMessageBound = this.handleProxyMessage.bind(this);
		navigator.locks.request("matter_proxy", {signal: this.proxyLock.signal}, (lock) => {
			console.debug(`[MatterWebProxy] Acquired primary lock (${lock?.name})`)
			this.isActiveProxy = true;
			this.sendProxyMessage({type: 'init'});
			this.proxyChannel.addEventListener("message", this.handleProxyMessageBound);

			return new Promise((resolve) => {
				this.proxyLock.signal.addEventListener("abort", () => {
					console.debug(`[MatterWebProxy] Lost primary lock (${lock?.name})`)
					this.isActiveProxy = false;
					this.proxyChannel.removeEventListener("message", this.handleProxyMessageBound);
					resolve(this.proxyLock.signal.reason)
				})
			})
		});

		this.events = new EventsService();

		// todo: should be done via events or explicit calls, not observable? Is any cleanup needed here?
		const activeDatabase$ = this.databaseSwitcherAPI.liveGet()
		activeDatabase$.subscribe((value) => {
			if (this.eventsBroadcastChannel) {
				this.eventsBroadcastChannel.close()
			}
			if (value.status === LiveQueryStatus.SUCCESS) {
				this.eventsBroadcastChannel = new BroadcastChannel(`matter_events_${value.result?.id}`)
				this.eventsBroadcastChannel.onmessage = (message: MessageEvent<MatterEvent>) => {
					this.events.dispatch(message.data.type, message.data.detail)
				}
			}
		})

		this.rxjs = new _MatterObservable(this)
	}

	private sendProxyMessage<T>(message: MatterProxyMessageTypes): Promise<T> {
		const mid = window.crypto.randomUUID();
		const messageWithId = {mid, ...message};

		if (this.isActiveProxy) {
			return this._sendMessageToWorker(messageWithId)
		}
		return this._forwardMessageToPrimaryProxy(messageWithId)
	}

	/**
	 * Send a message to the worker.
	 * Returns a promise which resolves with the worker response, throwing if an error is returned
	 * or no response is received within 5 seconds.
	 *
	 * @param message
	 * @private
	 */
	private _sendMessageToWorker<T>(message: MatterProxyMessage): Promise<T> {
		console.debug("[MatterWebProxy] _sendMessageToWorker", message)
		this.worker.postMessage(message)

		return new Promise<T>((resolve, reject) => {
			const timeoutHandler = setTimeout(() => {
				this.worker.removeEventListener('message', listener)
				console.error(`[MatterWebProxy] Timeout occurred waiting for worker response`, message)
				reject()
			}, 5000)

			const listener = (e: MessageEvent<MatterProxyMessageResponse>) => {
				if (e.data.mid === message.mid) {
					clearInterval(timeoutHandler)
					this.worker.removeEventListener('message', listener)

					if (e.data.result instanceof Error) {
						reject(e.data.result)
					}
					else
						resolve(e.data.result as T)
				}
			}
			this.worker.addEventListener('message', listener)
		})
	}

	private _forwardMessageToPrimaryProxy<T>(message: MatterProxyMessage): Promise<T> {
		console.debug("[MatterWebProxy] _forwardMessageToPrimaryProxy", message)
		this.proxyChannel.postMessage(message)

		return new Promise<T>((resolve, reject) => {
			const timeoutHandler = setTimeout(() => {
				this.proxyChannel.removeEventListener('message', listener)
				console.error(`[MatterWebProxy] Timeout occurred waiting for primary proxy response`, message)
				reject()
			}, 5000)

			const listener = (e: MessageEvent<MatterProxyMessageResponse>) => {
				if (e.data.mid === message.mid) {
					clearInterval(timeoutHandler)
					this.proxyChannel.removeEventListener('message', listener)

					if (e.data.result instanceof Error) {
						reject(e.data.result)
					}
					else
						resolve(e.data.result as T)
				}
			}
			this.proxyChannel.addEventListener('message', listener)
		})
	}

	private async handleProxyMessage(e: MessageEvent<MatterProxyMessage>) {
		if (!this.isActiveProxy) {
			console.error("[MatterWebProxy] Received message from proxy channel but is not active proxy.")
			return;
		}

		console.debug("[MatterWebProxy] Proxying message to worker", e)
		const result = await this._sendMessageToWorker(e.data)
		this.proxyChannel.postMessage({mid: e.data.mid, result})
	}

	async getActiveDatabase() {
		const database = await this.databaseSwitcherAPI.get()
		if (!database) {
			throw new Error("Attempted to call database but no active database is open")
		}
		return database
	}

	async create(createDocumentDto: CreateDocumentDto): Promise<MatterDocument> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: 'create',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [createDocumentDto]
		})
	}

	async update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<VersionData> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: 'update',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [id, updateDocumentDto]
		})
	}

	async delete(id: string): Promise<VersionData> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: 'delete',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [id]
		})
	}

	async purge(id: string): Promise<void> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: 'purge',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [id]
		})
	}

	async get(id: string): Promise<MatterDocument> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: 'get',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [id]
		})
	}

	async query(query?: Query): Promise<MatterDocument[]> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: 'query',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [query]
		})
	}

	async _UNSAFE_raw_query(UNSAFE_query: string): Promise<MatterDocument[]> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: '_UNSAFE_raw_query',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [UNSAFE_query]
		})
	}

	async createVersion(version: MatterDocument): Promise<MatterDocument> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: 'createVersion',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [version]
		})
	}

	async deleteVersion(vid: string): Promise<void> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: 'deleteVersion',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [vid]
		})
	}

	async purgeVersion(vid: string): Promise<void> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: 'purgeVersion',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [vid]
		})
	}

	async getVersion(vid: string): Promise<MatterDocument> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: 'getVersion',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [vid]
		})
	}

	async queryVersions(query?: Query): Promise<MatterDocument[]> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: 'queryVersions',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [query]
		})
	}

	async _UNSAFE_raw_queryVersions(UNSAFE_query: string): Promise<MatterDocument[]> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: '_UNSAFE_raw_queryVersions',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: [UNSAFE_query]
		})
	}

	async clean(): Promise<void> {
		const activeDatabase = await this.getActiveDatabase()
		return this.sendProxyMessage({
			type: 'matter-proxy',
			method: 'clean',
			databaseId: activeDatabase.id,
			databasePath: activeDatabase.path,
			params: []
		})
	}
}
