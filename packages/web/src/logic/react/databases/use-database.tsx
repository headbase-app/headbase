import {useEffect, useState} from "react";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "../../control-flow.ts";
import {useHeadbase} from "../use-headbase.tsx";
import {Logger} from "../../../utils/logger.ts";
import {LocalDatabaseDto} from "../../schemas/database.ts";

export function useDatabase(databaseId: string|null) {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<LocalDatabaseDto>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !databaseId) return

		const observable = headbase.databases.liveGet(databaseId)

		const subscription = observable.subscribe((result) => {
			if (result.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useDatabase] Received new data`, result.result)
			}
			setResult(result)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [databaseId, headbase])

	return result
}
