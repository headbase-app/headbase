import {useVaultsService} from "@/framework/vaults.context.ts";
import {createSignal} from "solid-js";
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";
import {CreateVaultDto} from "@api/vaults/local-vault.ts";
import {z} from "zod";
import {createStore} from "solid-js/store";

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
	const vaultsAPI = useVaultsService()
	const [values, setValues] = createStore<CreateVaultDto>({name: "", password: ""});
	const [errors, setErrors] = createStore<FieldErrors<CreateVaultDto>>({name: null, password: null});
	const [touched, setTouched] = createStore<FieldTouched<CreateVaultDto>>({name: false, password: false});
	const [error, setError] = createSignal<string|null>(null)

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault()
		setTouched({name: true, password: true})
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
			setErrors({
				name: errors.fieldErrors.name?.join(","),
				password: errors.fieldErrors.password?.join(",")
			})
			return false;
		}

		setErrors({name: null, password: null})
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

	return (
		<div>
			<button onClick={() => {props.navigate({type: "list"})}}>All vaults</button>
			<h3>Create new vault</h3>
			<div>
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
					<div>
						<label for="password">Password</label>
						<input
							id="password"
							name="password"
							type="password"
							placeholder="encryption password here..."
							value={values.password}
							onBlur={[onBlur, "password"]}
							onInput={(e) => {
								onInput("password", e.target.value)
							}}
						/>
						{(errors.password && touched.password) && (<p>{errors.password}</p>)}
					</div>
					{error() && (<p>{error()}</p>)}
					<div>
						<button type="submit">Create vault</button>
					</div>
				</form>
			</div>
		</div>
	)
}
