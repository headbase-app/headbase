import {Match, For, Switch, createEffect} from "solid-js";
import {useVaultsService} from "@/framework/vaults.context.ts";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult} from "@contracts/query.ts";
import {createStore} from "solid-js/store";
import type {VaultsList as VaultListDto} from "@api/vaults/vaults.service.ts";
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";

export interface VaultListProps {
	navigate: (page: VaultManagerPage) => void;
}

export function VaultsList(props: VaultListProps) {
	const vaultsAPI = useVaultsService()

	const [vaultsQuery, setVaultsQuery] = createStore<LiveQueryResult<VaultListDto>>(structuredClone(LIVE_QUERY_LOADING_STATE))
	createEffect(() => {
		const subscription = vaultsAPI.liveQuery((result) => {
			console.debug("VaultsList/vaultsQuery", result)
			setVaultsQuery(result)
		})
		return () => {subscription.unsubscribe()}
	})

	return (
		<div>
			<button onClick={() => {props.navigate({type: "create"})}}>Create</button>
			<h3>All vaults</h3>
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
				<Match when={vaultsQuery.status === "success" && vaultsQuery.result.length === 0}>
					<p>No vaults found.</p>
				</Match>
				<Match when={vaultsQuery.status === "success" && vaultsQuery.result} keyed>
					{(vaults) => (
						<ul>
							<For each={vaults}>
								{(vault) => (
									<li>
										<h3>{vault.name}</h3>
										<button onClick={() => {props.navigate({type: "delete", id: vault.id})}}>Delete</button>
										<button type="button" onClick={() => {props.navigate({type: "change-password", id: vault.id})}}>Change password</button>
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
