import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../../control-flow.ts";
import { useEffect, useState } from "react";
import {Logger} from "../../../utils/logger.ts";
import {useHeadbase} from "../use-headbase.tsx";
import {ContentItemDto} from "../../schemas/content-items/dtos.ts";


export function useItem(id: string) {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<ContentItemDto>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase) return

		const observable = headbase.db.liveGetItem(id)

		const subscription = observable.subscribe((query) => {
			if (query.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useContent] Received new data`, query.result)
			}

			setResult(query)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [headbase])

	return result
}
