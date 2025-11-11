import {VaultForm, type VaultFormFields} from "@ui/03-features/vault-manager/vault-form.tsx";
import {useVaultsAPI} from "@/framework/vaults.context.ts";
import {createSignal} from "solid-js";
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";

export interface CreateVaultProps {
	navigate: (page: VaultManagerPage) => void;
}

export function CreateVault(props: CreateVaultProps) {
	const vaultsAPI = useVaultsAPI()

	const [error, setError] = createSignal<string|null>(null)
	async function onCreate(fields: VaultFormFields) {
		try {
			await vaultsAPI.create(fields)
			props.navigate({type: "list"})
		}
		catch (e) {
			console.error(e)
			setError("There was an unexpected error creating your vault, please try again and/or report the issue on GitHub.")
		}
	}

	return (
		<div>
			<h3>Create new vault</h3>
			<button onClick={() => {props.navigate({type: "list"})}}>All vaults</button>
			<div>
				<VaultForm submitText="Create vault" onSubmit={onCreate} />
			</div>
			{error() && (<p>{error()}</p>)}
		</div>
	)
}
