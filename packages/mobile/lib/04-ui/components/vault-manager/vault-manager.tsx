import {Match, Switch} from "solid-js";
import {type SetStoreFunction} from "solid-js/store";

import {VaultsList} from "./vaults-list/vaults-list";
import {CreateVault} from "./create-vault/create-vault";
import {EditVault} from "./edit-vault/edit-vault";
import {DeleteVault} from "./delete-vault/delete-vault";

import "./vault-manager.css";


export type VaultManagerPage = {type: "list"} | {type: "create"} | {type: "edit", id: string} | {type: "delete", id: string};

export interface VaultManagerProps {
	page: VaultManagerPage
	setPage: SetStoreFunction<VaultManagerPage>
}

export function VaultManager(props: VaultManagerProps) {
	return (
		<Switch>
			<Match when={props.page.type === "list"}>
				<VaultsList navigate={props.setPage} />
			</Match>
			<Match when={props.page.type === "create"}>
				<CreateVault navigate={props.setPage} />
			</Match>
			<Match when={props.page.type === "edit" && props.page} keyed>
				{(page) => (
					<EditVault navigate={props.setPage} vaultId={page.id} />
				)}
			</Match>
			<Match when={props.page.type === "delete" && props.page} keyed>
				{(page) => (
					<DeleteVault navigate={props.setPage} vaultId={page.id} />
				)}
			</Match>
		</Switch>
	)
}
