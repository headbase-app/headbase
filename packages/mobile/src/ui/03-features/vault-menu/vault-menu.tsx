import {For, from, Match, Show, Switch} from "solid-js";
import ChevronDown from "lucide-solid/icons/chevron-down"

import {useVaultsService} from "@framework/vaults.context.ts";
import {useCurrentVaultService} from "@framework/current-vault.context.ts";

import "./vault-menu.css"


export function VaultMenu() {
	const vaultsService = useVaultsService()
	const currentVaultService = useCurrentVaultService()

	const vaultsQuery = from(vaultsService.liveQuery())
	const openVaultQuery = from(currentVaultService.liveGet())
	const openVault = () => {
		const query = openVaultQuery()
		if (query?.status === "success") return query.result
		return null
	}

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
			<button popovertarget="vault-switcher">{openVault()?.displayName ?? "Open vault"}<ChevronDown/></button>
			<div class="vault-switcher" popover id="vault-switcher">
				<div>
					<h3>Switch vaults</h3>
					<Switch>
						<Match when={vaultsQuery()?.status === "loading"}>
							<p>Loading vaults...</p>
						</Match>
						<Match
							when={(() => {
								const query= vaultsQuery(); return query?.status === 'error' ? query.errors : false
							})()} keyed
						>
							{(errors) => (
								<>
									<p>An unexpected error occurred while loading vaults, please refresh and/or report this issue on GitHub.</p>
									<p>{errors?.join(",")}</p>
								</>
							)}
						</Match>
						<Match
							when={(() => {
								const query= vaultsQuery(); return query?.status === 'success' ? query.result : false
							})()} keyed
						>
							{(vaults) => (
								<ul>
									<For each={vaults}>
										{(vault) => (
											<li>
												<h3>{vault.displayName}</h3>
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
