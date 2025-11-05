import {html, LitElement} from "lit";
import {z} from "zod";
import {customElement, state} from "lit/decorators.js";
import type {EventWithTarget} from "@utils/event-with-target.ts";

const CreateVaultFormFields = z.object({
	displayName: z.string().min(1, "Display name is required"),
	path: z.string().min(1, "Path is required."),
	password: z.string().min(12, "Your password must be at least 12 characters"),
})
type CreateVaultFormFields = z.infer<typeof CreateVaultFormFields>

export type FieldErrors<Fields> = {
	[field in keyof Fields]?: string;
};

export type FieldTouched<Fields> = {
	[field in keyof Fields]: boolean;
};

@customElement("vault-form")
export class VaultForm extends LitElement {
	@state() fields: CreateVaultFormFields
	@state() errors: FieldErrors<CreateVaultFormFields>
	@state() touched: FieldTouched<CreateVaultFormFields>

	constructor() {
		super();
		this.fields = {displayName: "", path: "", password: ""}
		this.errors = {}
		this.touched = {displayName: false, path: false, password: false}
	}

	#validate() {
		const result = CreateVaultFormFields.safeParse(this.fields)
		if (result.error) {
			const errors = z.flattenError(result.error)
			this.errors = {
				displayName: errors.fieldErrors.displayName?.join(","),
				path: errors.fieldErrors.path?.join(","),
				password: errors.fieldErrors.password?.join(",")
			}
			return false;
		}
		this.errors = {}
		return true
	}

	#onSubmit(e: SubmitEvent){
		e.preventDefault();
		this.touched = {displayName: true, path: true, password: true}
		this.#validate()
	}

	#onChange(field: keyof CreateVaultFormFields, e: EventWithTarget<HTMLInputElement>){
		this.fields[field] = e.target.value
		this.#validate()
	}

	#onBlur(field: keyof CreateVaultFormFields){
		this.touched[field] = true
		this.#validate()
	}

	render() {
		return html`
			<form @submit=${(e: SubmitEvent) => this.#onSubmit(e)}>
				<div>
					<label for="display-name">Display Name</label>
					<input
						id="display-name"
						name="display-name"
						placeholder="Example Vault"
						.value=${this.fields.displayName}
						@input=${(e: Event) => this.#onChange('displayName', e)}
						@blur=${() => this.#onBlur("displayName")}
					/>
					${(this.errors.displayName && this.touched.displayName) ? html`<p>${this.errors.displayName}</p>` : undefined}
				</div>
				<div>
					<label for="path">Path</label>
					<input
						id="path"
						name="path"
						placeholder="/path/to/vault"
						.value=${this.fields.path}
						@input=${(e: Event) => this.#onChange('path', e)}
						@blur=${() => this.#onBlur("path")}
					/>
					${(this.errors.path && this.touched.path) ? html`<p>${this.errors.path}</p>` : undefined}
				</div>
				<div>
					<label for="password">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						placeholder="password here..."
						.value=${this.fields.password}
						@input=${(e: Event) => this.#onChange('password', e)}
						@blur=${() => this.#onBlur("password")}
					/>
					${(this.errors.password && this.touched.password) ? html`<p>${this.errors.password}</p>` : undefined}
				</div>
				<div>
					<button type="submit">Create Vault</button>
				</div>
			</form>
		`
	}
}
