import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../../control-flow.ts";
import { useEffect, useState } from "react";
import {Logger} from "../../../utils/logger.ts";
import {useHeadbase} from "../use-headbase.tsx";
import {GlobalListingOptions} from "../../services/database/db.ts";
import {DataObject} from "../../services/database/transactions/types.ts";

export function useObjectQuery(options?: GlobalListingOptions) {
	const { headbase, currentDatabaseId } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<DataObject[]>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !currentDatabaseId) return
		const observable = headbase.db.objectStore.liveQuery(currentDatabaseId, options)

		const subscription = observable.subscribe((query) => {
			if (query.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useFieldQuery] Received new data`, query.result)
			}
			setResult(query)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [headbase, currentDatabaseId])

	return result
}
