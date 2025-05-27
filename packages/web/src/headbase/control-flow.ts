
export enum ErrorTypes {
	NOT_FOUND = 'not-found',
	INVALID_OR_CORRUPTED_DATA = 'invalid-or-corrupted-data',
	INVALID_PASSWORD_OR_KEY = 'invalid-password-or-key',
	SYSTEM_ERROR = 'system-error',
	NO_CURRENT_DATABASE = 'no-current-database',
	NETWORK_ERROR = 'network-error',
}

export interface HeadbaseErrorCause {
	type: ErrorTypes,
	originalError?: unknown,
	devMessage?: string
}

export class HeadbaseError extends Error {
	cause: HeadbaseErrorCause

	constructor(cause: HeadbaseErrorCause) {
		super();
		this.cause = cause
	}
}

export interface QueryResult<T> {
	result: T,
	errors?: unknown[]
}

export const LiveQueryStatus = {
	LOADING: "loading",
	SUCCESS: "success",
	ERROR: "error"
} as const

export type LiveQueryResult<Data = null> = {
	status: typeof LiveQueryStatus.LOADING,
} | {
	status: typeof LiveQueryStatus.SUCCESS,
	result: Data,
	errors?: unknown[]
} | {
	status: typeof LiveQueryStatus.ERROR,
	errors: unknown[]
}

export const LIVE_QUERY_LOADING_STATE = {
	status: LiveQueryStatus.LOADING,
} as const
