import { Observable } from "rxjs";
import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../control-flow";
import { useEffect, useState } from "react";
import {Logger} from "../../src/utils/logger";

/**
 * A helper hook which integrates a Headbase observable query into React state,
 * automatically handling default state.
 *
 * @param observable
 */
export function useObservableQuery<Data>(observable: Observable<LiveQueryResult<Data>>|undefined) {
	const [state, setState] = useState<LiveQueryResult<Data>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!observable) {
			console.warn('useObservableQuery called with no observable')
			return
		}

		const subscription = observable.subscribe((query) => {
			if (query.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useObservableQuery] Received new data`, query.result)
			}
			setState(query)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [])

	return state
}
