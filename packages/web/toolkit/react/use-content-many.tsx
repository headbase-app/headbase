import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../control-flow";
import { useEffect, useState } from "react";
import {Logger} from "../../src/utils/logger";
import {useHeadbase} from "./use-headbase";
import {TableKeys, TableTypeDefinitions} from "../types/types";
import {EntityDto} from "../types/data-entities";


export function useContentMany<
	TableTypes extends TableTypeDefinitions,
	TableKey extends TableKeys<TableTypes>
>(databaseId: string|null, tableKey: TableKey, ids: string[]) {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<EntityDto<TableTypes[TableKey]>[]>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !databaseId) return

		const observable = headbase.tx.liveGetMany(databaseId, tableKey, ids)

		const subscription = observable.subscribe((result) => {
			if (result.status === LiveQueryStatus.SUCCESS) {
				Logger.debug(`[useContentMany] Received new data`, result.result)
			}
			setResult(result)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [databaseId, headbase])

	return result
}
