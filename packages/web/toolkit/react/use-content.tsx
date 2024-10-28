import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../control-flow";
import { useEffect, useState } from "react";
import {Logger} from "../../src/utils/logger";
import {useHeadbase} from "./use-headbase";
import {TableKeys, TableTypeDefinitions} from "@headbase-toolkit/schemas/tables";
import {EntityDto} from "@headbase-toolkit/schemas/entities";


export function useContent<
	TableTypes extends TableTypeDefinitions,
	TableKey extends TableKeys<TableTypes>
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
