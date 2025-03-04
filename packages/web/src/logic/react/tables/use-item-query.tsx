import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../../control-flow.ts";
import { useEffect, useState } from "react";
import {Logger} from "../../../utils/logger.ts";
import {useHeadbase} from "../use-headbase.tsx";
import {GlobalListingOptions} from "../../services/database/db.ts";
import {ContentItemDto} from "../../schemas/content-items/dtos.ts";


export function useContentItemQuery(options?: GlobalListingOptions) {
	const { headbase, currentDatabaseId } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<ContentItemDto[]>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !currentDatabaseId) return
		const observable = headbase.db.contentItems.liveQuery(currentDatabaseId, options)

		const subscription = observable.subscribe((query) => {
			if (query.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useItemQuery] Received new data`, query.result)
			}
			setResult(query)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [headbase, currentDatabaseId])

	return result
}
