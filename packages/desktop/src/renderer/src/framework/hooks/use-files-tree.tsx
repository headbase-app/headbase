import {useEffect, useState} from "react";
import {useDependency} from "@framework/dependency.context";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult} from "@contracts/query";
import {FileSystemDirectory} from "@/main/apis/files/operations";

export function useFilesTree(): LiveQueryResult<FileSystemDirectory|null> {
	const { filesApi } = useDependency()
	const [result, setResult] = useState<LiveQueryResult<FileSystemDirectory|null>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		const subscription = filesApi.liveTree(setResult)
		return () => {
			subscription.unsubscribe()
		}
	}, [filesApi])

	return result
}
