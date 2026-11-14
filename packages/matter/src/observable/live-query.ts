export const LiveQueryStatus = {
    LOADING: "loading",
    SUCCESS: "success",
    ERROR: "error"
} as const

export type LiveQueryResult<Data = null> = {
    status: typeof LiveQueryStatus.LOADING,
    result: null,
} | {
    status: typeof LiveQueryStatus.SUCCESS,
    result: Data,
    errors?: unknown[]
} | {
    status: typeof LiveQueryStatus.ERROR,
    result: null,
    errors: unknown[]
}

export const LIVE_QUERY_LOADING_STATE = {
    status: LiveQueryStatus.LOADING,
    result: null,
} as const

export const LIVE_QUERY_EMPTY = {
    status: LiveQueryStatus.SUCCESS,
    result: null
} as const
