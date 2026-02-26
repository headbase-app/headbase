import {Match, Switch} from "solid-js";
import {type SetStoreFunction} from "solid-js/store";

import {CreateVault} from "@ui/03-features/vault-manager/create-vault/create-vault.tsx";
import {VaultsList} from "@ui/03-features/vault-manager/vaults-list/vaults-list.tsx";
import {EditVault} from "@ui/03-features/vault-manager/edit-vault/edit-vault.tsx";
import {DeleteVault} from "@ui/03-features/vault-manager/delete-vault/delete-vault.tsx";

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
