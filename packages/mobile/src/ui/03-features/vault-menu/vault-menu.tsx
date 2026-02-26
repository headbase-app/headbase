import {For, from, Match, Show, Switch} from "solid-js";
import ChevronUpIcon from "lucide-solid/icons/chevron-up"
import ContentTypesIcon from "lucide-solid/icons/shapes"
import FileExplorerIcon from "lucide-solid/icons/folder"
import SearchIcon from "lucide-solid/icons/search"
import NewFileIcon from "lucide-solid/icons/plus"

import {useVaultsService} from "@framework/vaults.context.ts";
import {useCurrentVaultService} from "@framework/current-vault.context.ts";
import {useWorkspace} from "@ui/03-features/workspace/workspace.context.ts";
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";

import "./vault-menu.css"


export function VaultMenu() {
	const vaultsService = useVaultsService()
	const currentVaultService = useCurrentVaultService()
	const workspaceAPI = useWorkspace()

	const vaultsQuery = from(vaultsService.liveQuery())
	const openVaultQuery = from(currentVaultService.liveGet())
	const openVault = () => {
		const query = openVaultQuery()
		if (query?.status === "success") return query.result
		return null
	}

	function dispatchOpenVaultManager(page?: VaultManagerPage) {
		document.dispatchEvent(new CustomEvent("vault-manager-open", {detail: page}))
	}
	function dispatchOpenVault(vaultId: string) {
		currentVaultService.open(vaultId)
	}
	function dispatchCloseVault() {
		currentVaultService.close()
	}

	return (
		<>
			<div class="vault-menu">
				<button popovertarget="vault-switcher">{openVault()?.displayName ?? "Open vault"}<ChevronUpIcon /></button>
				<button onClick={() => {workspaceAPI.openTab({type: "content-types"})}}><ContentTypesIcon /></button>
				<button onClick={() => {workspaceAPI.openTab({type: "file-explorer"})}}><FileExplorerIcon /></button>
				<button onClick={() => {workspaceAPI.openTab({type: "search"})}}><SearchIcon /></button>
				<button onClick={() => {workspaceAPI.openTab({type: "file-new"})}}><NewFileIcon /></button>
			</div>
			<div class="vault-switcher" popover id="vault-switcher">
				<div>
					<Switch>
						<Match when={vaultsQuery()?.status === "loading"}>
							<p>Loading vaults...</p>
						</Match>
						<Match
							when={(() => {
								const query = vaultsQuery();
								return query?.status === 'error' ? query.errors : false
							})()} keyed
						>
							{(errors) => (
								<>
									<p>An unexpected error occurred while loading vaults, please refresh and/or report this issue on
										GitHub.</p>
									<p>{errors?.join(",")}</p>
								</>
							)}
						</Match>
						<Match
							when={(() => {
								const query = vaultsQuery();
								return query?.status === 'success' ? query.result : false
							})()} keyed
						>
							{(vaults) => (
								<ul>
									<For each={vaults}>
										{(vault) => (
											<li>
												<h3>{vault.displayName}</h3>
												<button onClick={() => {dispatchOpenVaultManager({type: "edit", id: vault.id})}}>Edit</button>
												<button>New tab</button>
												<Show when={openVault()?.id === vault.id}>
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
				<button onClick={() => {dispatchOpenVaultManager()}}>manage vaults</button>
			</div>
		</>
	)
}
