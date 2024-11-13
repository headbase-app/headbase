import {SqlQueryResponse} from "./adapters/adapter";

export interface BaseClientEvent {
	messageId: string
}

export interface BaseWorkerResponseEvent {
	targetMessageId: string
}

export interface ClientOpenEvent extends BaseClientEvent {
	type: 'open',
	detail: {
		databaseId: string
		contextId: string
		encryptionKey: string
	}
}

export interface WorkerOpenResponseEvent extends BaseWorkerResponseEvent {
	type: 'open',
	detail: {
		success: true
	} | {
		success: false,
		error: string
	}
}

export interface ClientQueryEvent extends BaseClientEvent {
	type: 'query',
	detail: {
		databaseId: string
		contextId: string
		sql: string
		params: unknown[]
	}
}

export interface WorkerQueryResponseEvent extends BaseWorkerResponseEvent {
	type: 'query',
	detail: {
		success: true,
		result: SqlQueryResponse
	} | {
		success: false,
		error: string
	}
}


export interface ClientCloseEvent extends BaseClientEvent {
	type: 'close',
	detail: {
		databaseId: string
		contextId: string
	}
}

export interface WorkerCloseResponseEvent extends BaseWorkerResponseEvent {
	type: 'close',
	detail: {
		success: true
	} | {
		success: false,
		error: string
	}
}

export interface ClientExportEvent extends BaseClientEvent {
	type: 'export',
	detail: {
		databaseId: string
		contextId: string
	}
}
