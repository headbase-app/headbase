import type {ObjectDto, Query} from "@api/database/types.ts";
import {createEffect, createSignal} from "solid-js";
import {useDatabase} from "@/framework/use-database.ts";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult} from "@api/control-flow.ts";
import {Subscription} from "rxjs";

export function useObjectsQuery(query?: Query) {
	const database = useDatabase()
	const [results, setResults] = createSignal<LiveQueryResult<ObjectDto[]>>(LIVE_QUERY_LOADING_STATE)

	createEffect((prev?: Subscription) => {
		if (prev) {
			prev.unsubscribe()
		}

		const hb = database()
		if (hb) {
			const listener = hb.liveQuery(query)
			return listener.subscribe((result) => {
				setResults(result)
			})
		}
	})

	return results
}
