import {createSignal, onMount, Show} from "solid-js";
import {createStore} from "solid-js/store";
import {z} from "zod";
import {VaultDto, UpdateVaultDto} from "@headbase-app/libweb";
import {useVaultsAPI} from "@framework/vaults.context.ts";
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";

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
	const vaultsAPI = useVaultsAPI()
	const [values, setValues] = createStore<UpdateVaultDto>({displayName: "", path: ""});
	const [errors, setErrors] = createStore<FieldErrors<UpdateVaultDto>>({displayName: null, path: null});
	const [touched, setTouched] = createStore<FieldTouched<UpdateVaultDto>>({displayName: false, path: false});
	const [error, setError] = createSignal<string|null>(null)

	const [vault, setVault] = createSignal<VaultDto|null>(null)
	onMount(async () => {
		const loadedVault = await vaultsAPI.get(props.vaultId)
		setVault(loadedVault)
		setValues({displayName: loadedVault?.displayName, path: loadedVault?.path})
	})

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault()
		setTouched({displayName: true, path: true})
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
				displayName: errors.fieldErrors.displayName?.join(","),
				path: errors.fieldErrors.path?.join(","),
			})
			return false;
		}

		setErrors({displayName: null, path: null})
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
						<h3>Edit vault '{vault.displayName}'</h3>
						<form onSubmit={onSubmit}>
							<div>
								<label for="name">Display Name</label>
								<input
									id="name"
									name="name"
									placeholder="Example Vault"
									value={values.displayName}
									onBlur={[onBlur, "displayName"]}
									onInput={(e) => {
										onInput("displayName", e.target.value)
									}}
								/>
								{(errors.displayName && touched.displayName) && (<p>{errors.displayName}</p>)}
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
