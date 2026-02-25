import {createSignal, Show} from "solid-js";
import {z} from "zod";
import {createStore} from "solid-js/store";

import {CreateVaultDto} from "@headbase-app/libweb";
import {useVaultsService} from "@framework/vaults.context.ts";
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";
import {useFilesAPI} from "@framework/files-api.context.ts";

export type FieldErrors<Fields> = {
	[field in keyof Fields]: string | null;
};
export type FieldTouched<Fields> = {
	[field in keyof Fields]: boolean;
};


export interface CreateVaultProps {
	navigate: (page: VaultManagerPage) => void;
}

export function CreateVault(props: CreateVaultProps) {
	const filesAPI = useFilesAPI()
	const vaultsAPI = useVaultsService()
	const [values, setValues] = createStore<CreateVaultDto>({displayName: "", path: ""});
	const [errors, setErrors] = createStore<FieldErrors<CreateVaultDto>>({displayName: null, path: null});
	const [touched, setTouched] = createStore<FieldTouched<CreateVaultDto>>({displayName: false, path: false});
	const [error, setError] = createSignal<string|null>(null)

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault()
		setTouched({displayName: true, path: true})

		if (!filesAPI.isVaultLocationSelectable() && values.displayName) {
			setValues("path", `/headbase-v1/vaults/${values.displayName}`)
		}

		const isValid = validate()
		if (isValid) {
			try {
				await vaultsAPI.create(values)
				props.navigate({type: "list"})
			}
			catch (e) {
				console.error(e)
				setError("There was an unexpected error creating your vault, please try again and/or report the issue on GitHub.")
			}
		}
	}

	function validate() {
		const result = CreateVaultDto.safeParse(values)
		if (result.error) {
			const errors = z.flattenError(result.error)
			console.debug(errors)
			setErrors({
				displayName: errors.fieldErrors.displayName?.join(","),
				path: errors.fieldErrors.path?.join(",")
			})
			return false;
		}

		setErrors({displayName: null, path: null})
		return true
	}

	function onBlur(field: keyof CreateVaultDto) {
		setTouched(field, true)
		validate()
	}

	function onInput(field: keyof CreateVaultDto, value: string) {
		setValues(field, value)
		validate()
	}

	async function selectVaultPath() {
		const path = await filesAPI.selectVaultLocation()
		if (path) {
			setValues("path", path)
		}
	}

	return (
		<div>
			<button onClick={() => {props.navigate({type: "list"})}}>All vaults</button>
			<h3>Create new vault</h3>
			<div>
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

					<label>Vault Location</label>
					<Show when={filesAPI.isVaultLocationSelectable()} fallback={<p>Vault location is not user managed on this platform. Try the desktop or mobile app for more control over your files.</p>}>
						<div>
							<Show when={values.path} fallback={<p>No Location Selected</p>}>
								<p>{filesAPI.getPathDisplay(values.path)}</p>
							</Show>
							<button type="button" onClick={selectVaultPath}>Select Location</button>
							{(errors.path && touched.path) && (<p>{errors.path}</p>)}
						</div>
					</Show>
					{error() && (<p>{error()}</p>)}
					<div>
						<button type="submit">Create vault</button>
					</div>
				</form>
			</div>
		</div>
	)
}
