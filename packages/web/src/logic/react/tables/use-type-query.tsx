import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../../control-flow.ts";
import { useEffect, useState } from "react";
import {Logger} from "../../../utils/logger.ts";
import {useHeadbase} from "../use-headbase.tsx";
import {GlobalListingOptions} from "../../services/database/db.ts";
import {ContentTypeDto} from "../../schemas/content-types/dtos.ts";


export function useContentTypeQuery(options?: GlobalListingOptions) {
	const { headbase, currentDatabaseId } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<ContentTypeDto[]>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !currentDatabaseId) return
		const observable = headbase.db.contentTypes.liveQuery(currentDatabaseId, options)

		const subscription = observable.subscribe((query) => {
			if (query.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useContentTypeQuery] Received new data`, query.result)
			}
			if (query.status === LiveQueryStatus.ERROR) {
				console.error(query.errors)
			}

			setResult(query)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [headbase, currentDatabaseId])

	return result
}
