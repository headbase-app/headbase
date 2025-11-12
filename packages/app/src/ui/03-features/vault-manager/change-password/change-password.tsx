import {createSignal, onMount, Show} from "solid-js";
import {useVaultsService} from "@/framework/vaults.context.ts";
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";
import {type LocalVaultDto, UpdateVaultPasswordDto} from "@api/vaults/local-vault.ts";
import {z} from "zod";
import {createStore} from "solid-js/store";
import {ErrorTypes, HeadbaseError} from "@api/control-flow.ts";

export interface ChangeVaultPasswordProps {
	vaultId: string;
	navigate: (page: VaultManagerPage) => void;
}

export type FieldErrors<Fields> = {
	[field in keyof Fields]: string | null;
};
export type FieldTouched<Fields> = {
	[field in keyof Fields]: boolean;
};


export function ChangeVaultPassword(props: ChangeVaultPasswordProps) {
	const vaultsService = useVaultsService()
	const [values, setValues] = createStore<UpdateVaultPasswordDto>({password: "", newPassword: ""});
	const [errors, setErrors] = createStore<FieldErrors<UpdateVaultPasswordDto>>({password: null, newPassword: null});
	const [touched, setTouched] = createStore<FieldTouched<UpdateVaultPasswordDto>>({password: false, newPassword: false});
	const [error, setError] = createSignal<string|null>(null)

	const [vault, setVault] = createSignal<LocalVaultDto|null>(null)
	onMount(async () => {
		const loadedVault = await vaultsService.get(props.vaultId)
		setVault(loadedVault)
	})

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault()
		setTouched({password: true})
		const isValid = validate()
		if (isValid) {
			try {
				await vaultsService.changePassword(props.vaultId, values.password, values.newPassword)
				props.navigate({type: "list"})
			}
			catch (e) {
				if (e instanceof HeadbaseError && e.cause.type === ErrorTypes.INVALID_PASSWORD_OR_KEY) {
					console.error(e.cause)
					setError("The current password you entered is incorrect, please try again.")
				}
				else {
					console.error(e)
					setError("There was an unexpected error changing your vault password, please try again and/or report the issue on GitHub.")
				}
			}
		}
	}

	function validate() {
		const result = UpdateVaultPasswordDto.safeParse(values)
		if (result.error) {
			const errors = z.flattenError(result.error)
			setErrors({
				password: errors.fieldErrors.password?.join(","),
				newPassword: errors.fieldErrors.newPassword?.join(","),
			})
			return false;
		}

		setErrors({password: null, newPassword: null})
		return true
	}

	function onBlur(field: keyof UpdateVaultPasswordDto) {
		setTouched(field, true)
		validate()
	}

	function onInput(field: keyof UpdateVaultPasswordDto, value: string) {
		setValues(field, value)
		setError(null)
		validate()
	}

	return (
		<div>
			<button onClick={() => {props.navigate({type: "list"})}}>All vaults</button>
			<Show when={vault()} fallback={<p>Loading vault....</p>} keyed>
				{vault => (
					<div>
						<h3>Change password for '{vault.name}'</h3>
						<form onSubmit={onSubmit}>
							<div>
								<label for="password">Current Password</label>
								<input
									type='password'
									id="password"
									name="password"
									placeholder="current password..."
									value={values.password}
									onBlur={() => {
										onBlur("password")
									}}
									onInput={(e) => {
										onInput("password", e.target.value)
									}}
								/>
								{(errors.password && touched.password) && (<p>{errors.password}</p>)}
							</div>
							<div>
								<label for="name">New Password</label>
								<input
									type='password'
									id="new-password"
									name="new-password"
									placeholder="new password..."
									value={values.newPassword}
									onBlur={() => {
										onBlur("newPassword")
									}}
									onInput={(e) => {
										onInput("newPassword", e.target.value)
									}}
								/>
								{(errors.newPassword && touched.newPassword) && (<p>{errors.newPassword}</p>)}
							</div>
							{error() && (<p>{error()}</p>)}
							<div>
								<button type="submit">Change password</button>
							</div>
						</form>
					</div>
				)}
			</Show>
		</div>
	)
}
