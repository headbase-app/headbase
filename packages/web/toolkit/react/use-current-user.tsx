import {useEffect, useState} from "react";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "../control-flow";
import {useHeadbase} from "./use-headbase";
import {Logger} from "../../src/utils/logger";
import {LocalUserDto} from "../services/general-storage.service";


export function useCurrentUser() {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<LocalUserDto|null>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase) return

		const observable = headbase.server.liveGetCurrentUser()

		const subscription = observable.subscribe((result) => {
			if (result.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useCurrentUser] Received new data`, result.result)
			}
			setResult(result)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [headbase])

	return result
}
