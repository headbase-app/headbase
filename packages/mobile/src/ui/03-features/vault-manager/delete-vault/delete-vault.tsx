import {createSignal, onMount, Show} from "solid-js";
import type {VaultDto} from "@headbase-app/libweb";
import {useVaultsService} from "@framework/vaults.context.ts";
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";

export interface DeleteVaultProps {
	vaultId: string;
	navigate: (page: VaultManagerPage) => void;
}

export function DeleteVault(props: DeleteVaultProps) {
	const vaultsAPI = useVaultsService()

	const [vault, setVault] = createSignal<VaultDto|null>(null)
	onMount(async () => {
		const loadedVault = await vaultsAPI.get(props.vaultId)
		setVault(loadedVault)
	})

	const [error, setError] = createSignal<string|null>(null)
	async function onDelete(e: SubmitEvent) {
		e.preventDefault()

		try {
			await vaultsAPI.delete(props.vaultId)
			props.navigate({type: "list"})
		}
		catch (error) {
			console.error(error)
			setError("There was an unexpected error deleting your vault, please try again and/or report the issue on GitHub.")
		}
	}

	return (
		<div>
			<button onClick={() => {props.navigate({type: "list"})}}>All vaults</button>

			<Show when={vault()} fallback={<p>Loading vault....</p>} keyed>
				{vault => (
					<form onSubmit={onDelete}>
						<p>Are you sure you want to delete vault '{vault.displayName}'?</p>
						<p>This is a irreversible action, your vault and all files will be permanently lost.</p>
						<button type="submit" >Confirm Deletion</button>
					</form>
				)}
			</Show>
			{error() && <p>{error()}</p>}
		</div>
	)
}
