import {html, nothing, render} from "lit-html";
import {when} from "lit-html/directives/when.js";

import {BaseElement, useContext, FilesAPIContext, type FormErrors, FormHelper, observe, dispatchEvent} from "@headbase-app/lib";
import type {VaultManagerEvents} from "./vault-manager";

export type VaultFormEvents = {
	SUBMIT: "vault-form:submit"
}

export interface VaultFormFields {
	displayName: string
	path: string
}

export class VaultForm extends BaseElement {
	static tag = "hb-vault-form"
	filesAPI = useContext(FilesAPIContext)
	initialValues?: VaultFormFields
	formHelper!: FormHelper<VaultFormFields>

	onSubmit!: (values: VaultFormFields) => void
	title!: string
	submitText!: string

	constructor() {
		super()
		this.formHelper = new FormHelper<VaultFormFields>(this.initialValues ?? {displayName: "", path: ""}, {
			validate: (values) => {
				const errors: FormErrors<VaultFormFields> = {fields: {}}
				if (values.displayName.length === 0) {
					errors.fields.displayName = "Display name is required"
				}
				if (this.filesAPI.isVaultLocationSelectable()) {
					if (values.path.length === 0) {
						errors.fields.path = "Folder path is required"
					} else if (values.path.length > 255) {
						errors.fields.path = "Folder path can't be greater than 255 characters"
					}
				}

				return errors.root || errors.fields.displayName || errors.fields.path ? errors : undefined
			},
			onSubmit: async (values) => {
				try {
					this.onSubmit(values)
				}
				catch (error) {
					console.error(error)
					this.formHelper.root.error.next("There was an unexpected error submitting, please try again and/or report the issue on GitHub.")
				}
			}
		})
	}

	connectedCallback() {
		super.connectedCallback();
		if (this.initialValues) {
			this.formHelper.reset(this.initialValues)
		}
	}

	async selectVaultPath() {
		const path = await this.filesAPI.selectVaultLocation()
		if (path) {
			this.formHelper.setField("path", path)
		}
	}

	render() {
		render(html`
			<div>
				<button @click=${() => {dispatchEvent<VaultManagerEvents>(this, "vault-manager:navigate", {type: "list"})}}>All vaults</button>
				<h3>${this.title}</h3>
				<div>
					<form @submit=${this.formHelper.submit.bind(this.formHelper)}>
						<div>
							<label for="name">Display Name</label>
							${observe(this.formHelper.fields.displayName, (field) => html`
								<input
									id="name"
									name="name"
									placeholder="Example Vault"
									value=${field.value}
									@input=${(e: Event) => this.formHelper.setField("displayName", (e.currentTarget as HTMLInputElement).value)}
									@blur=${() => this.formHelper.onBlur("displayName")}
								/>
								${field.error && field.touched && field.blurred ? html`<p>${field.error}</p>`: nothing}
							`)}
						</div>
						<div>
							<label>Vault Location</label>
							${when(
								this.filesAPI.isVaultLocationSelectable(),
								() => html`
									<div>
										${observe(
										this.formHelper.fields.path,
										(field) => html`<p>${field.value && field.touched ? this.filesAPI.getPathDisplay(field.value) : "No Folder Selected"}</p>`,
									)}
										<button type="button" onClick=${this.selectVaultPath}>Select Location</button>
									</div>
								`,
								() => html`<p>Vault location is not user managed on this platform. Try the desktop or mobile app for more control over your files.</p>`,
							)}
						</div>
						${observe(this.formHelper.root.error, (error) => error ? html`<p>${error}</p>`: nothing)}
						<button type="submit">${this.submitText}</button>
					</form>
				</div>
			</div>
		`, this)
	}
}
