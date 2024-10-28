import {useEffect, useState} from "react";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "../control-flow";
import {useHeadbase} from "./use-headbase";
import {Logger} from "../../src/utils/logger";
import {LocalDatabaseDto} from "@headbase-toolkit/schemas/database";

export function useDatabases() {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<LocalDatabaseDto[]>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase) return

		const observable = headbase.databases.liveQuery()

		const subscription = observable.subscribe((result) => {
			if (result.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useDatabases] Received new data`, result.result)
			}
			setResult(result)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [headbase])

	return result
}
