import {useEffect, useState} from "react";
import {OPFSXDirectoryTree} from "opfsx";
import {useHeadbase} from "../use-headbase.tsx";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult} from "../../control-flow.ts";


export function useFileTree(vaultId: string | null) {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<OPFSXDirectoryTree>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !vaultId) return

		const observable = headbase.fileSystem.liveTree(vaultId)

		const subscription = observable.subscribe((result) => {
			setResult(result)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [headbase, vaultId])

	return result
}
