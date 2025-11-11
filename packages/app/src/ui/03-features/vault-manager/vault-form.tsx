import {z} from "zod";
import {createStore, unwrap} from "solid-js/store";

export interface VaultFormProps {
	submitText: string
	fields?: VaultFormFields
	onSubmit: (fields: VaultFormFields) => void
}

export const VaultFormFields = z.object({
	displayName: z.string().min(1, "Display name is required"),
	path: z.string().min(1, "Path is required."),
	password: z.string().min(12, "Your password must be at least 12 characters"),
})
export type VaultFormFields = z.infer<typeof VaultFormFields>

export type FieldErrors<Fields> = {
	[field in keyof Fields]: string | null;
};
export type FieldTouched<Fields> = {
	[field in keyof Fields]: boolean;
};

export function VaultForm(props: VaultFormProps) {
	const [values, setValues] = createStore<VaultFormFields>(props.fields ?? {displayName: "", path: "", password: ""});
	const [errors, setErrors] = createStore<FieldErrors<VaultFormFields>>({displayName: null, path: null, password: null});
	const [touched, setTouched] = createStore<FieldTouched<VaultFormFields>>({displayName: false, path: false, password: false});

function validate() {
		const result = VaultFormFields.safeParse(values)
		if (result.error) {
			const errors = z.flattenError(result.error)
			setErrors({
				displayName: errors.fieldErrors.displayName?.join(","),
				path: errors.fieldErrors.path?.join(","),
				password: errors.fieldErrors.password?.join(",")
			})
			return false;
		}

		setErrors({displayName: null, path: null, password: null})
		return true
	}

	function onSubmit(e: SubmitEvent) {
		e.preventDefault()
		setTouched({displayName: true, path: true, password: true})
		const isValid = validate()
		if (isValid) {
			props.onSubmit(unwrap(values))
		}
	}

	function onBlur(field: keyof VaultFormFields) {
		setTouched(field, true)
		validate()
	}

	function onInput(field: keyof VaultFormFields, value: string) {
		setValues(field, value)
		validate()
	}

	return (
		<form onSubmit={onSubmit}>
			<div>
				<label for="display-name">Display Name</label>
				<input
					id="display-name"
					name="display-name"
					placeholder="Example Vault"
					value={values.displayName}
					onBlur={[onBlur, "displayName"]}
					onInput={(e) => {onInput("displayName", e.target.value)}}
				/>
				{(errors.displayName && touched.displayName) && (<p>{errors.displayName}</p>)}
			</div>
			<div>
				<label for="path">Path</label>
				<input
					id="path"
					name="path"
					placeholder="/path/to/vault"
					value={values.path}
					onBlur={[onBlur, "path"]}
					onInput={(e) => {onInput("path", e.target.value)}}
				/>
				{(errors.path && touched.path) && (<p>{errors.path}</p>)}
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
					onInput={(e) => {onInput("password", e.target.value)}}
				/>
				{(errors.password && touched.password) && (<p>{errors.password}</p>)}
			</div>
			<div>
				<button type="submit">{props.submitText}</button>
			</div>
		</form>
	)
}
