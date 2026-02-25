import {Match, For, Switch, from, Show} from "solid-js";
import {useVaultsService} from "@framework/vaults.context.ts";
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";

export interface VaultListProps {
	navigate: (page: VaultManagerPage) => void;
}

export function VaultsList(props: VaultListProps) {
	const vaultsAPI = useVaultsService()
	const vaultsQuery = from(vaultsAPI.liveQuery())

	return (
		<div>
			<button onClick={() => {props.navigate({type: "create"})}}>Create</button>
			<h3>All vaults</h3>
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
						<ul>
							<Show when={vaults.length === 0}>
								<p>No vaults found</p>
							</Show>
							<For each={vaults}>
								{(vault) => (
									<li>
										<h3>{vault.displayName}</h3>
										<button onClick={() => {props.navigate({type: "delete", id: vault.id})}}>Delete</button>
										<button onClick={() => {props.navigate({type: "edit", id: vault.id})}}>Edit</button>
									</li>
								)}
							</For>
						</ul>
					)}
				</Match>
			</Switch>
		</div>
	)
}
