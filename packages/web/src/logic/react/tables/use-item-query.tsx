import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../../control-flow.ts";
import { useEffect, useState } from "react";
import {Logger} from "../../../utils/logger.ts";
import {useHeadbase} from "../use-headbase.tsx";
import {GlobalListingOptions} from "../../services/database/database-transactions.ts";
import {ContentItemDto} from "../../schemas/content-items/dtos.ts";


export function useContentItemQuery(options?: GlobalListingOptions) {
	const { headbase, currentDatabaseId } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<ContentItemDto[]>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !currentDatabaseId) return
		const observable = headbase.db.liveQueryItems(options)

		const subscription = observable.subscribe((query) => {
			if (query.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useContentQuery] Received new data`, query.result)
			}
			setResult(query)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [headbase])

	return result
}
