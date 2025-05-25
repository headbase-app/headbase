import {useEffect, useState} from "react";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "../../control-flow.ts";
import {useHeadbase} from "../use-headbase.tsx";
import {Logger} from "../../../utils/logger.ts";
import {LocalVaultDto} from "../../services/vault/local-vault.ts";

export function useVaults() {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<LocalVaultDto[]>>(LIVE_QUERY_LOADING_STATE)

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
