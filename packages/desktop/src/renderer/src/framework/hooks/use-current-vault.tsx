import {LocalVaultDto} from "@contracts/vaults";
import {useEffect, useState} from "react";
import {useDependency} from "@framework/dependency.context";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult} from "@contracts/query";

export function useCurrentVault(): LiveQueryResult<LocalVaultDto|null> {
	const { currentVaultApi } = useDependency()
	const [result, setResult] = useState<LiveQueryResult<LocalVaultDto|null>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		const subscription = currentVaultApi.liveGet(setResult)
		return () => {
			subscription.unsubscribe()
		}
	}, [currentVaultApi])

	return result
}
