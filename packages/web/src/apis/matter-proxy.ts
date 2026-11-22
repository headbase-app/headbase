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
	private workerChannel: BroadcastChannel

	events: IEventsService
	private eventsBroadcastChannel?: BroadcastChannel

	rxjs: _MatterObservable

	constructor(
		private worker: Worker,
		private databaseSwitcherAPI: IDatabaseSwitcherAPI
	) {
		this.workerChannel = new BroadcastChannel("matter_worker");
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

	/**
	 * Send a message to the active worker.
	 * Resolves with the worker response, rejects if the response is an error or no response received within 5 seconds.
	 *
	 * @param message
	 */
	private sendProxyMessage<T>(message: MatterProxyMessageTypes): Promise<T> {
		const mid = window.crypto.randomUUID();
		const messageWithId = {mid, ...message};
		console.debug("[MatterWebProxy] sendProxyMessage", messageWithId);

		this.workerChannel.postMessage(messageWithId);

		return new Promise<T>((resolve, reject) => {
			const timeoutHandler = setTimeout(() => {
				this.workerChannel.removeEventListener('message', listener)
				console.error(`[MatterWebProxy] Timeout occurred waiting for 'matter_worker' response`, message)
				reject()
			}, 5000)

			const listener = (e: MessageEvent<MatterProxyMessageResponse>) => {
				if (e.data.mid === mid) {
					clearInterval(timeoutHandler)
					this.workerChannel.removeEventListener('message', listener)

					if (e.data.result instanceof Error) {
						reject(e.data.result)
					}
					else
						resolve(e.data.result as T)
				}
			}
			this.workerChannel.addEventListener('message', listener)
		})
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
