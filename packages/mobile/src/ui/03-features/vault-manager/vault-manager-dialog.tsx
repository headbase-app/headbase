import {onCleanup, onMount} from "solid-js";
import {createStore} from "solid-js/store";
import CloseIcon from "lucide-solid/icons/x"

import {VaultManager, type VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";

import "./vault-manager.css";


export function VaultManagerDialog () {
	let dialog!: HTMLDialogElement
	const [page, setPage] = createStore<VaultManagerPage>({type: "list"})

	function openDialog(e: CustomEvent<VaultManagerPage|undefined>) {
		console.debug(e)
		if (e.detail) {
			setPage(e.detail)
		}
		dialog?.showModal()
	}

	function closeDialog() {
		dialog?.close()
	}

	onMount(() => {
		// @ts-expect-error -- this is listening for custom event, so openDialog is fine.
		document.addEventListener("vault-manager-open", openDialog)
	})
	onCleanup(() => {
		// @ts-expect-error -- this is listening for custom event, so openDialog is fine.
		document.removeEventListener("vault-manager-open", openDialog)
	})

	return (
		<dialog class="vault-manager" ref={dialog}>
			<button autofocus aria-label={"Close"} onClick={closeDialog}><CloseIcon/></button>
			<VaultManager page={page} setPage={setPage} />
		</dialog>
	)
}
