import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../control-flow";
import { useEffect, useState } from "react";
import {Logger} from "../../utils/logger.ts";
import {useHeadbase} from "./use-headbase.tsx";
import {QueryDefinition} from "@headbase-toolkit/schemas/query";
import {EntityDto} from "@headbase-toolkit/schemas/common/entities";
import {TableKeys, TableTypes} from "@headbase-toolkit/schemas/schema";

export function useContentQuery<
	TableKey extends TableKeys
>(databaseId: string|null, query: QueryDefinition<TableKey>) {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<EntityDto<TableTypes[TableKey]>[]>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !databaseId) return
		const observable = headbase.tx.liveQuery(databaseId, query)

		const subscription = observable.subscribe((result) => {
			if (result.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useContentQuery] Received new data`, result.result)
			}
			setResult(result)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [databaseId, headbase])

	return result
}
