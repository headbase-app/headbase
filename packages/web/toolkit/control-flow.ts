
export enum ErrorTypes {
	ENTITY_NOT_FOUND = 'entity-not-found',
	VERSION_NOT_FOUND = 'version-not-found',
	DATABASE_NOT_FOUND = 'database-not-found',
	INVALID_OR_CORRUPTED_DATA = 'invalid-or-corrupted-data',
	INVALID_PASSWORD_OR_KEY = 'invalid-password-or-key',
	SYSTEM_ERROR = 'system-error',
	NO_CURRENT_DATABASE = 'no-current-database',
	NETWORK_ERROR = 'network-error',
}

export interface LocalfulErrorCause {
	type: ErrorTypes,
	originalError?: unknown,
	devMessage?: string
}

export class LocalfulError extends Error {
	cause: LocalfulErrorCause

	constructor(cause: LocalfulErrorCause) {
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

export const LIVE_QUERY_LOADING_STATE= {
	status: LiveQueryStatus.LOADING,
} as const
