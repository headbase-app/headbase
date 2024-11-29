import {useEffect, useState} from "react";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "../control-flow";
import {useHeadbase} from "./use-headbase.tsx";
import {Logger} from "../../utils/logger.ts";
import {LocalDatabaseDto} from "@headbase-toolkit/schemas/database";

export function useDatabase(databaseId: string|null) {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<LocalDatabaseDto>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		console.debug(headbase, databaseId)
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
