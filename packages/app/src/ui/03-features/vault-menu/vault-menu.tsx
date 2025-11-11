import {createEffect, For, Match, Switch} from "solid-js";
import {createStore} from "solid-js/store";
import ChevronDown from "lucide-solid/icons/chevron-down"

import {useVaultsAPI} from "@/framework/vaults.context.ts";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult} from "@contracts/query.ts";
import type {VaultsList as VaultListDto} from "@api/vaults/vaults.api.ts";

import "./vault-menu.css"

export function VaultMenu() {
	const vaultsAPI = useVaultsAPI()

	const [vaultsQuery, setVaultsQuery] = createStore<LiveQueryResult<VaultListDto>>(LIVE_QUERY_LOADING_STATE)
	createEffect(() => {
		const subscription = vaultsAPI.liveQuery(setVaultsQuery)
		return () => {subscription.unsubscribe()}
	})

	function dispatchOpen() {
		document.dispatchEvent(new CustomEvent("vault-manager-open", {}))
	}

	return (
		<div class="vault-menu">
			<button popovertarget="vault-switcher">Open vault <ChevronDown/></button>
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
						<Match when={vaultsQuery.status === "success" && !vaultsQuery.result}>
							<p>No vaults found.</p>
						</Match>
						<Match when={vaultsQuery.status === "success" && vaultsQuery.result} keyed>
							{(vaults) => (
								<ul>
									<For each={vaults}>
										{(vault) => (
											<li>
												<h3>{vault.displayName}</h3>
												<button>Open</button>
											</li>
										)}
									</For>
								</ul>
							)}
						</Match>
					</Switch>

				</div>
				<button onClick={dispatchOpen}>manage vaults</button>
			</div>
		</div>
	)
}
