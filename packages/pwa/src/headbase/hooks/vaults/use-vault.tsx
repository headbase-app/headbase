import {useEffect, useState} from "react";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "../../control-flow.ts";
import {useHeadbase} from "../use-headbase.tsx";
import {LocalVaultDto} from "../../services/vaults/local-vault.ts";


export function useVault(vaultId: string|null) {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<LocalVaultDto>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !vaultId) return

		const observable = headbase.vaults.liveGet(vaultId)

		const subscription = observable.subscribe((result) => {
			if (result.status === LiveQueryStatus.SUCCESS) {
				//Logger.debug(`[useDatabase] Received new data`, result.result)
			}
			setResult(result)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [vaultId, headbase])

	return result
}
