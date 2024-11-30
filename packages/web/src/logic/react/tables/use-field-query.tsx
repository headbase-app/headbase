import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../../control-flow.ts";
import { useEffect, useState } from "react";
import {Logger} from "../../../utils/logger.ts";
import {useHeadbase} from "../use-headbase.tsx";
import {GlobalListingOptions} from "../../../lib/headbase-core/database.ts";
import {FieldDto} from "../../schemas/fields/dtos.ts";


export function useFieldQuery(options?: GlobalListingOptions) {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<FieldDto[]>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase) return
		const observable = headbase.db.liveQueryFields(options)

		const subscription = observable.subscribe((query) => {
			if (query.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useContentQuery] Received new data`, query.result)
			}
			setResult(query)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [headbase])

	return result
}
