import {SqlQueryResponse} from "./adapter";

export interface BaseEvent {
	messageId: string
}

export interface BaseResponseEvent {
	targetMessageId: string
}

export interface OpenEvent extends BaseEvent {
	type: 'open',
	detail: {
		databaseId: string
		contextId: string
		encryptionKey: string
	}
}

export interface OpenResponseEvent extends BaseResponseEvent {
	type: 'open',
	detail: {
		success: true
	} | {
		success: false,
		error: string
	}
}

export interface QueryEvent extends BaseEvent {
	type: 'query',
	detail: {
		databaseId: string
		contextId: string
		sql: string
		params: unknown[]
	}
}

export interface QueryResponseEvent extends BaseResponseEvent {
	type: 'query',
	detail: {
		success: true,
		result: SqlQueryResponse
	} | {
		success: false,
		error: string
	}
}


export interface CloseEvent extends BaseEvent {
	type: 'close',
	detail: {
		databaseId: string
		contextId: string
	}
}

export interface CloseResponseEvent extends BaseResponseEvent {
	type: 'close',
	detail: {
		success: true
	} | {
		success: false,
		error: string
	}
}

export interface ExportEvent extends BaseEvent {
	type: 'export',
	detail: {
		databaseId: string
		contextId: string
	}
}

export interface ExportResponseEvent extends BaseResponseEvent {
	type: 'export',
	detail: {
		success: true
		database: Uint8Array
	} | {
		success: false,
		error: string
	}
}

export interface ErrorEvent {
	type: 'error'
	targetMessageId?: string
	detail: {
		error: string
	}
}

export type AdapterEvents = OpenEvent | QueryEvent | CloseEvent | ExportEvent
export type WorkerEvents = OpenResponseEvent | QueryResponseEvent | CloseResponseEvent | ExportResponseEvent | ErrorEvent
