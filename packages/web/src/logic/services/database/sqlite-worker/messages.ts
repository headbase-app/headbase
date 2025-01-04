import {DeviceContext, SqlQueryResponse} from "../../interfaces.ts";
import {HeadbaseErrorCause} from "../../../control-flow.ts";

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
	type: 'exec',
	detail: {
		context: DeviceContext
		databaseId: string
		sql: string
		params: unknown[],
		// todo: remove after migration away from drizzle
		rowMode?: 'array' | 'object'
	}
}

export interface QueryResponseMessage extends BaseResponseMessage {
	type: 'exec',
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

export interface DeleteMessage extends BaseMessage {
	type: 'delete',
	detail: {
		context: DeviceContext
		databaseId: string
	}
}

export interface DeleteResponseMessage extends BaseResponseMessage {
	type: 'delete',
	detail: {
		success: true
	} | {
		success: false,
		error: string
	}
}

export interface ErrorMessage {
	type: 'error'
	targetMessageId?: string
	detail: {
		cause: HeadbaseErrorCause
	}
}

export type ClientMessages = OpenMessage | QueryMessage | CloseMessage | ExportMessage | DeleteMessage
export type WorkerMessages = OpenResponseMessage | QueryResponseMessage | CloseResponseMessage | ExportResponseMessage | DeleteResponseMessage | ErrorMessage
