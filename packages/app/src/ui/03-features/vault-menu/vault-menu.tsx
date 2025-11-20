import {createEffect, For, Match, Show, Switch} from "solid-js";
import {createStore} from "solid-js/store";
import ChevronDown from "lucide-solid/icons/chevron-down"

import {useVaultsService} from "@/framework/vaults.context.ts";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult} from "@contracts/query.ts";
import type {VaultsList as VaultListDto} from "@api/vaults/vaults.service.ts";

import "./vault-menu.css"
import {useCurrentVaultService} from "@/framework/current-vault.context.ts";
import type {LocalVaultDto} from "@api/vaults/local-vault.ts";

export function VaultMenu() {
	const vaultsService = useVaultsService()
	const currentVaultService = useCurrentVaultService()

	const [vaultsQuery, setVaultsQuery] = createStore<LiveQueryResult<VaultListDto>>(structuredClone(LIVE_QUERY_LOADING_STATE))
	createEffect(() => {
		const subscription = vaultsService.liveQuery((result) => {
			console.debug("VaultMenu/vaultsQuery", result)
			setVaultsQuery(result)
		})
		return () => {subscription.unsubscribe()}
	})

	const [openVaultQuery, setOpenVaultQuery] = createStore<LiveQueryResult<LocalVaultDto|null>>(structuredClone(LIVE_QUERY_LOADING_STATE))
	createEffect(() => {
		const subscription = currentVaultService.liveGet((result) => {
			console.debug("VaultMenu/openVaultQuery", result)
			setOpenVaultQuery(result)
		})
		return () => {subscription.unsubscribe()}
	})
	const openVault = () => {return openVaultQuery.status === "success" ? openVaultQuery.result : null}

	function dispatchOpenVaultManager() {
		document.dispatchEvent(new CustomEvent("vault-manager-open", {}))
	}

	function dispatchOpenVault(vaultId: string) {
		currentVaultService.open(vaultId)
	}

	function dispatchCloseVault() {
		currentVaultService.close()
	}

	return (
		<div class="vault-menu">
			<button popovertarget="vault-switcher">{openVault()?.name ?? "Open vault"}<ChevronDown/></button>
			<div class="vault-switcher" popover id="vault-switcher">
				<div>
					<h3>Switch vaults</h3>
					<Switch>
						<Match when={vaultsQuery.status === "loading"}>
							<p>Loading vaults...</p>
						</Match>
						<Match when={vaultsQuery.status === "error" && vaultsQuery} keyed>
							{(result) => (
								<>
									<p>An unexpected error occurred while loading vaults, please refresh and/or report this issue on GitHub.</p>
									<p>{result.errors.join(",")}</p>
								</>
							)}
						</Match>
						<Match when={vaultsQuery.status === "success" && vaultsQuery.result?.length === 0}>
							<p>No vaults found.</p>
						</Match>
						<Match when={vaultsQuery.status === "success" && vaultsQuery.result} keyed>
							{(vaults) => (
								<ul>
									<For each={vaults}>
										{(vault) => (
											<li>
												<h3>{vault.name}</h3>
												<a href={`/?vaultId=${vault.id}`} target="_blank">Open in new tab</a>
												<Show when={openVault()?.id === vault.id}>
													<p>Currently open</p>
													<button onClick={() => {dispatchCloseVault()}}>Close</button>
												</Show>
												<Show when={openVault()?.id !== vault.id}>
													<button onClick={() => {dispatchOpenVault(vault.id)}}>Open</button>
												</Show>
											</li>
										)}
									</For>
								</ul>
							)}
						</Match>
					</Switch>

				</div>
				<button onClick={dispatchOpenVaultManager}>manage vaults</button>
			</div>
		</div>
	)
}
