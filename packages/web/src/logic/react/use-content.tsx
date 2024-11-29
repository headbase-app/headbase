import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../control-flow";
import { useEffect, useState } from "react";
import {Logger} from "../../utils/logger.ts";
import {useHeadbase} from "./use-headbase.tsx";
import {EntityDto} from "@headbase-toolkit/schemas/common/entities";
import {TableKeys, TableTypes} from "@headbase-toolkit/schemas/schema";


export function useContent<
	TableKey extends TableKeys
>(databaseId: string|null, tableKey: TableKey, id: string) {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<EntityDto<TableTypes[TableKey]>>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !databaseId) return

		const observable = headbase.tx.liveGet(databaseId, tableKey, id)

		const subscription = observable.subscribe((result) => {
			if (result.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useContent] Received new data`, result.result)
			}
			setResult(result)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [databaseId, headbase])

	return result
}
