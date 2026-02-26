import {Match, For, Switch, from, Show} from "solid-js";
import {useVaultsService} from "@framework/vaults.context.ts";
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";
import {useCurrentVaultService} from "@framework/current-vault.context.ts";
import {useFilesAPI} from "@framework/files-api.context.ts";

export interface VaultListProps {
	navigate: (page: VaultManagerPage) => void;
}

export function VaultsList(props: VaultListProps) {
	const filesAPI = useFilesAPI()
	const vaultsAPI = useVaultsService()
	const workspaceVaultAPI = useCurrentVaultService()
	const vaultsQuery = from(vaultsAPI.liveQuery())

	const openVaultQuery = from(workspaceVaultAPI.liveGet())
	const openVault = () => {
		const query = openVaultQuery()
		if (query?.status === "success") return query.result
		return null
	}

	return (
		<div>
			<button onClick={() => {props.navigate({type: "create"})}}>Create</button>
			<Switch>
				<Match when={vaultsQuery()?.status === "loading"}>
					<p>Loading vaults...</p>
				</Match>
				<Match
					when={(() => {
						const vaults= vaultsQuery(); return vaults?.status === 'error' ? vaults.errors : false
					})()} keyed
				>
					{(errors) => (
						<>
							<p>An unexpected error occurred while loading vaults, please refresh and/or report this issue on GitHub.</p>
							<p>{errors.join(",")}</p>
						</>
					)}
				</Match>
				<Match
					when={(() => {
						const vaults= vaultsQuery(); return vaults?.status === 'success' ? vaults.result : false
					})()} keyed
				>
					{(vaults) => (
						<>
							<Show when={vaults.length === 0}>
								<p>No vaults found</p>
							</Show>
							<ul>
								<For each={vaults}>
									{(vault) => (
										<li>
											<h3>{vault.displayName}</h3>
											<Show when={filesAPI.isVaultLocationSelectable()}><p>{vault.path}</p></Show>
											<button onClick={() => {props.navigate({type: "delete", id: vault.id})}}>Delete</button>
											<button onClick={() => {props.navigate({type: "edit", id: vault.id})}}>Edit</button>
											<button>New tab</button>
											<Show when={openVault()?.id !== vault.id}><button onClick={() => {workspaceVaultAPI.open(vault.id)}}>Open</button></Show>
											<Show when={openVault()?.id === vault.id}><button onClick={() => {workspaceVaultAPI.close()}}>Close</button></Show>
										</li>
									)}
								</For>
							</ul>
						</>
					)}
				</Match>
			</Switch>
		</div>
	)
}
