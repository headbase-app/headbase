import {createEffect, createSignal, from} from "solid-js";
import {useCurrentVaultService} from "@/framework/current-vault.context.ts";
import {HeadbaseDB} from "@api/headbase/headbase.ts";

export function useDatabase() {
	const currentVaultService = useCurrentVaultService()
	const currentVaultQuery = from(currentVaultService.liveGet())
	const [database, setDatabase] = createSignal<HeadbaseDB>()

	createEffect(() => {
		const query = currentVaultQuery()
		if (query?.status === "success" && query.result) {
			const hb = new HeadbaseDB({filePath: `/headbase-v1/${query.result.id}.hb`})
			setDatabase(hb)
		}
	})

	return database
}
