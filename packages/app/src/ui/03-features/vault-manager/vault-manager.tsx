import {Match, onCleanup, onMount, Switch} from "solid-js";
import {createStore} from "solid-js/store";
import CloseIcon from "lucide-solid/icons/x"

import "./vault-manager.css";
import {CreateVault} from "@ui/03-features/vault-manager/create-vault/create-vault.tsx";
import {VaultsList} from "@ui/03-features/vault-manager/vaults-list/vaults-list.tsx";
import {EditVault} from "@ui/03-features/vault-manager/edit-vault/edit-vault.tsx";
import {DeleteVault} from "@ui/03-features/vault-manager/delete-vault/delete-vault.tsx";
import {ChangeVaultPassword} from "@ui/03-features/vault-manager/change-password/change-password.tsx";


export type VaultManagerPage = {type: "list"} | {type: "create"} | {type: "edit", id: string} | {type: "delete", id: string} | {type: "change-password", id: string};

export function VaultManager () {
	let dialog!: HTMLDialogElement
	const [page, setPage] = createStore<VaultManagerPage>({type: "list"})

	function openDialog() {
		dialog?.showModal()
	}

	function closeDialog() {
		setPage({type: "list"})
		dialog?.close()
	}

	onMount(() => {
		document.addEventListener("vault-manager-open", openDialog)
	})
	onCleanup(() => {
		document.removeEventListener("vault-manager-open", openDialog)
	})

	return (
		<dialog class="vault-manager" ref={dialog}>
			<button autofocus aria-label={"Close"} onClick={closeDialog}><CloseIcon/></button>
			<Switch>
				<Match when={page.type === "list"}>
					<VaultsList navigate={setPage} />
				</Match>
				<Match when={page.type === "create"}>
					<CreateVault navigate={setPage} />
				</Match>
				<Match when={page.type === "edit" && page} keyed>
					{(page) => (
						<EditVault navigate={setPage} vaultId={page.id} />
					)}
				</Match>
				<Match when={page.type === "delete" && page} keyed>
					{(page) => (
						<DeleteVault navigate={setPage} vaultId={page.id} />
					)}
				</Match>
				<Match when={page.type === "change-password" && page} keyed>
					{(page) => (
						<ChangeVaultPassword navigate={setPage} vaultId={page.id} />
					)}
				</Match>
			</Switch>
		</dialog>
	)
}
