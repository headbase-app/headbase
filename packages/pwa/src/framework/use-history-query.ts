import type {ObjectVersionDto} from "@api/headbase/types.ts";
import {createEffect, createSignal} from "solid-js";
import {useDatabase} from "@/framework/use-database.ts";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult} from "@api/headbase/control-flow.ts";
import {Subscription} from "rxjs";

export function useHistoryQuery(objectId: string) {
	const database = useDatabase()
	const [results, setResults] = createSignal<LiveQueryResult<ObjectVersionDto[]>>(LIVE_QUERY_LOADING_STATE)

	createEffect((prev?: Subscription) => {
		if (prev) {
			prev.unsubscribe()
		}

		const hb = database()
		if (hb) {
			const listener = hb.liveQueryHistory(objectId)
			return listener.subscribe((result) => {
				setResults(result)
			})
		}
	})

	return results
}
