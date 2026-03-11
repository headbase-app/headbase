import {createSignal, from, Show} from "solid-js";

import type {VaultManagerPage} from "../vault-manager";
import {useVaultsAPI} from "../../../../03-framework/vaults.context";

export interface DeleteVaultProps {
	vaultId: string;
	navigate: (page: VaultManagerPage) => void;
}

export function DeleteVault(props: DeleteVaultProps) {
	const vaultsAPI = useVaultsAPI()
	const vault = from(vaultsAPI.liveGet(props.vaultId))

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

			<Show
				when={(() => {
					const v = vault()
					return v?.status === "success" && v.result
				})()}
				fallback={<p>Loading vault....</p>}
				keyed
			>
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
