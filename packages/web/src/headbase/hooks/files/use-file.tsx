import { LIVE_QUERY_LOADING_STATE, LiveQueryResult } from "../../control-flow.ts";
import { useEffect, useState } from "react";
import {useHeadbase} from "../use-headbase.tsx";


export function useFile(path: string) {
	const { headbase, currentDatabaseId } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !currentDatabaseId) return
		setResult(LIVE_QUERY_LOADING_STATE)

		return () => {}
	}, [headbase, currentDatabaseId, path])

	return result
}
