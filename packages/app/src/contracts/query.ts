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

export type LiveQuerySubscriber<Data> = (result: LiveQueryResult<Data>) => void

export interface LiveQuerySubscription {
	unsubscribe: () => void
}
