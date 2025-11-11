import {createSignal, onMount, Show} from "solid-js";

import {VaultForm, type VaultFormFields} from "@ui/03-features/vault-manager/vault-form.tsx";
import {useVaultsAPI} from "@/framework/vaults.context.ts";
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";
import type {LocalVaultDto} from "@contracts/vaults.ts";

export interface EditVaultProps {
	vaultId: string;
	navigate: (page: VaultManagerPage) => void;
}

export function EditVault(props: EditVaultProps) {
	const vaultsAPI = useVaultsAPI()

	const [vault, setVault] = createSignal<LocalVaultDto|null>(null)
	onMount(async () => {
		const loadedVault = await vaultsAPI.get(props.vaultId)
		setVault(loadedVault)
	})

	const [error, setError] = createSignal<string|null>(null)
	async function onEdit(fields: VaultFormFields) {
		try {
			await vaultsAPI.update(props.vaultId, fields)
			props.navigate({type: "list"})
		}
		catch (error) {
			console.error(error)
			setError("There was an unexpected error updating your vault, please try again and/or report the issue on GitHub.")
		}
	}

	return (
		<div>
			<button onClick={() => {props.navigate({type: "list"})}}>All vaults</button>

			<Show when={vault()} fallback={<p>Loading vault....</p>} keyed>
				{vault => (
					<div>
						<h3>Edit vault '{vault.displayName}'</h3>
						<VaultForm submitText="Save" onSubmit={onEdit} fields={vault} />
					</div>
				)}
			</Show>
			{error() && <p>{error()}</p>}
		</div>
	)
}
