import {createSignal, onMount, Show} from "solid-js";
import {useVaultsService} from "@/framework/vaults.context.ts";
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";
import {type LocalVaultDto, UpdateVaultDto} from "@api/vaults/local-vault.ts";
import {z} from "zod";
import {createStore} from "solid-js/store";

export interface EditVaultProps {
	vaultId: string;
	navigate: (page: VaultManagerPage) => void;
}

export type FieldErrors<Fields> = {
	[field in keyof Fields]: string | null;
};
export type FieldTouched<Fields> = {
	[field in keyof Fields]: boolean;
};


export function EditVault(props: EditVaultProps) {
	const vaultsAPI = useVaultsService()
	const [values, setValues] = createStore<UpdateVaultDto>({name: ""});
	const [errors, setErrors] = createStore<FieldErrors<UpdateVaultDto>>({name: null});
	const [touched, setTouched] = createStore<FieldTouched<UpdateVaultDto>>({name: false});
	const [error, setError] = createSignal<string|null>(null)

	const [vault, setVault] = createSignal<LocalVaultDto|null>(null)
	onMount(async () => {
		const loadedVault = await vaultsAPI.get(props.vaultId)
		setVault(loadedVault)
		setValues({name: loadedVault.name})
	})

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault()
		setTouched({name: true})
		const isValid = validate()
		if (isValid) {
			try {
				await vaultsAPI.update(props.vaultId, values)
				props.navigate({type: "list"})
			}
			catch (e) {
				console.error(e)
				setError("There was an unexpected error updating your vault, please try again and/or report the issue on GitHub.")
			}
		}
	}

	function validate() {
		const result = UpdateVaultDto.safeParse(values)
		if (result.error) {
			const errors = z.flattenError(result.error)
			setErrors({
				name: errors.fieldErrors.name?.join(","),
			})
			return false;
		}

		setErrors({name: null})
		return true
	}

	function onBlur(field: keyof UpdateVaultDto) {
		setTouched(field, true)
		validate()
	}

	function onInput(field: keyof UpdateVaultDto, value: string) {
		setValues(field, value)
		validate()
	}

	return (
		<div>
			<button onClick={() => {props.navigate({type: "list"})}}>All vaults</button>
			<Show when={vault()} fallback={<p>Loading vault....</p>} keyed>
				{vault => (
					<div>
						<h3>Edit vault '{vault.name}'</h3>
						<form onSubmit={onSubmit}>
							<div>
								<label for="name">Name</label>
								<input
									id="name"
									name="name"
									placeholder="Example Vault"
									value={values.name}
									onBlur={[onBlur, "name"]}
									onInput={(e) => {
										onInput("name", e.target.value)
									}}
								/>
								{(errors.name && touched.name) && (<p>{errors.name}</p>)}
							</div>
							{error() && (<p>{error()}</p>)}
							<div>
								<button type="submit">Save</button>
							</div>
						</form>
					</div>
				)}
			</Show>
		</div>
	)
}
