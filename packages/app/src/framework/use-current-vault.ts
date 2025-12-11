import {createStore} from "solid-js/store";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult, type LiveQuerySubscription} from "@contracts/query.ts";
import type {LocalVaultDto} from "@api/vaults/local-vault.ts";
import {onCleanup, onMount} from "solid-js";
import {useCurrentVaultService} from "@/framework/current-vault.context.ts";

export function useCurrentVault() {
	const currentVaultService = useCurrentVaultService();

	const [openVaultQuery, setOpenVaultQuery] = createStore<LiveQueryResult<LocalVaultDto|null>>(structuredClone(LIVE_QUERY_LOADING_STATE))

	let subscription: LiveQuerySubscription
	onMount(() => {
		subscription = currentVaultService.liveGet((result) => {
			setOpenVaultQuery(result)
		})
	})
	onCleanup(() => {
		subscription?.unsubscribe()
	})

	return openVaultQuery
}
