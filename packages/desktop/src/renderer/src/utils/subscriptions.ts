export const SubscriptionResultStatus = {
	LOADING: "loading",
	SUCCESS: "success",
	ERROR: "error"
} as const

export type SubscriptionResult<Data = null> = {
	status: typeof SubscriptionResultStatus.LOADING,
} | {
	status: typeof SubscriptionResultStatus.SUCCESS,
	result: Data,
	errors?: unknown[]
} | {
	status: typeof SubscriptionResultStatus.ERROR,
	errors: unknown[]
}

export const SUBSCRIPTION_LOADING_STATE = {
	status: SubscriptionResultStatus.LOADING,
} as const

export type Subscriber<Data> = (result: SubscriptionResult<Data>) => void

export interface Subscription {
	unsubscribe: () => void
}
