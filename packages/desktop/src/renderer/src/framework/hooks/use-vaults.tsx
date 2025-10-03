import {LocalVaultDto} from "@contracts/vaults";
import {useEffect, useState} from "react";
import {useDependency} from "@framework/dependency.context";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult} from "@contracts/query";

export function useVaults(): LiveQueryResult<LocalVaultDto[]> {
	const { vaultsApi } = useDependency()
	const [result, setResult] = useState<LiveQueryResult<LocalVaultDto[]>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		const subscription = vaultsApi.liveQuery(setResult)
		return () => {
			subscription.unsubscribe()
		}
	}, [vaultsApi])

	return result
}
