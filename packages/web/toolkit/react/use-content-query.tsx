import { LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus } from "../control-flow";
import { useEffect, useState } from "react";
import {Logger} from "../../src/utils/logger";
import {useHeadbase} from "./use-headbase";
import {TableKeys, TableSchemaDefinitions, TableTypeDefinitions} from "@headbase-toolkit/schemas/tables";
import {QueryDefinition} from "@headbase-toolkit/schemas/query";
import {EntityDto} from "@headbase-toolkit/schemas/entities";


export function useContentQuery<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>,
	TableKey extends TableKeys<TableTypes>
>(databaseId: string|null, query: QueryDefinition<TableTypes, TableSchemas, TableKey>) {
	const { headbase } = useHeadbase()
	const [result, setResult] = useState<LiveQueryResult<EntityDto<TableTypes[TableKey]>[]>>(LIVE_QUERY_LOADING_STATE)

	useEffect(() => {
		if (!headbase || !databaseId) return

		// @ts-expect-error -- todo: fix type issues
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
