import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../../control-flow.ts";
import { useEffect, useState } from "react";
import {Logger} from "../../../utils/logger.ts";
import {useHeadbase} from "../use-headbase.tsx";
import {ContentTypeDto} from "../../schemas/content-types/dtos.ts";


export function useContentType(id: string) {
	const { headbase, currentDatabaseId } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<ContentTypeDto>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !currentDatabaseId) return

		const observable = headbase.db.contentTypes.liveGet(currentDatabaseId, id)

		const subscription = observable.subscribe((query) => {
			if (query.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useContentType] Received new data`, query.result)
			}

			setResult(query)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [headbase, currentDatabaseId, id])

	return result
}
