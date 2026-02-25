import {LocalVaultDto} from "@contracts/vaults";
import {useEffect, useState} from "react";
import {useDependency} from "@framework/dependency.context";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult} from "@contracts/query";

export function useVault(vaultId: string): LiveQueryResult<LocalVaultDto|null> {
	const { vaultsApi } = useDependency()
	const [result, setResult] = useState<LiveQueryResult<LocalVaultDto|null>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		const subscription = vaultsApi.liveGet(vaultId, setResult)
		return () => {
			subscription.unsubscribe()
		}
	}, [vaultId, vaultsApi])

	return result
}
