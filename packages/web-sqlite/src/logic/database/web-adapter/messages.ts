import {DeviceContext, SqlQueryResponse} from "../adapter.ts";

export interface BaseMessage {
	messageId: string
}

export interface BaseResponseMessage {
	targetMessageId: string
}

export interface OpenMessage extends BaseMessage {
	type: 'open',
	detail: {
		context: DeviceContext
		databaseId: string
		encryptionKey: string
	}
}

export interface OpenResponseMessage extends BaseResponseMessage {
	type: 'open',
	detail: {
		success: true
	} | {
		success: false,
		error: string
	}
}

export interface QueryMessage extends BaseMessage {
	type: 'query',
	detail: {
		context: DeviceContext
		databaseId: string
		sql: string
		params: unknown[]
	}
}

export interface QueryResponseMessage extends BaseResponseMessage {
	type: 'query',
	detail: {
		success: true,
		result: SqlQueryResponse
	} | {
		success: false,
		error: string
	}
}


export interface CloseMessage extends BaseMessage {
	type: 'close',
	detail: {
		context: DeviceContext
		databaseId: string
	}
}

export interface CloseResponseMessage extends BaseResponseMessage {
	type: 'close',
	detail: {
		success: true
	} | {
		success: false,
		error: string
	}
}

export interface ExportMessage extends BaseMessage {
	type: 'export',
	detail: {
		context: DeviceContext
		databaseId: string
	}
}

export interface ExportResponseMessage extends BaseResponseMessage {
	type: 'export',
	detail: {
		success: true
		database: Uint8Array
	} | {
		success: false,
		error: string
	}
}

export interface ErrorMessage {
	type: 'error'
	targetMessageId?: string
	detail: {
		error: string
	}
}

export type ClientMessages = OpenMessage | QueryMessage | CloseMessage | ExportMessage
export type WorkerMessages = OpenResponseMessage | QueryResponseMessage | CloseResponseMessage | ExportResponseMessage | ErrorMessage
