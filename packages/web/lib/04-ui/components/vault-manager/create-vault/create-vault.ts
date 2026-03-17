import {html, nothing, render} from "lit-html";
import {when} from "lit-html/directives/when.js";

import {BaseElement} from "../../../../03-framework/base-element";
import {useContext} from "../../../../03-framework/context";
import {FilesAPIContext, VaultsAPIContext} from "../../../../03-framework/contexts";
import {VaultManagerEvents, type VaultManagerPage} from "../vault-manager";
import {type FormErrors, FormHelper} from "../../../../03-framework/form-helper.ts";
import {observe} from "../../../../03-framework/observe-directive.ts";

interface CreateVaultForm {
	displayName: string
	folderPath: string
}

export class CreateVault extends BaseElement {
	static tag = "hb-create-vault"
	vaultsAPI = useContext(VaultsAPIContext)
	filesAPI = useContext(FilesAPIContext)
	formHelper: FormHelper<CreateVaultForm>

	constructor() {

		super();
		this.formHelper = new FormHelper<CreateVaultForm>({displayName: "", folderPath: ""}, {
			validate: (values) => {
				const errors: FormErrors<CreateVaultForm> = {fields: {}}
				if (values.displayName.length === 0) {
					errors.fields.displayName = "Display name is required"
				}
				if (this.filesAPI.isVaultLocationSelectable()) {
					if (values.folderPath.length === 0) {
						errors.fields.folderPath = "Folder path is required"
					} else if (values.folderPath.length > 255) {
						errors.fields.folderPath = "Folder path can't be greater than 255 characters"
					}
				}

				return errors.root || errors.fields.displayName || errors.fields.folderPath ? errors : undefined
			},
			onSubmit: async (values) => {
				try {
					await this.vaultsAPI.create({displayName: values.displayName, path: `/headbase-v1/vaults/${values.displayName}`})
					this.navigateVaultManager({type: "list"})
				}
				catch (error) {
					console.error(error)
					this.formHelper.root.error.next("There was an unexpected error creating your vault, please try again and/or report the issue on GitHub.")
				}
			}
		})
	}

	navigateVaultManager(page: VaultManagerPage) {
		this.dispatchEvent(new CustomEvent(VaultManagerEvents.NAVIGATE, {
			detail: page,
			bubbles: true,
		}))
	}

	onSubmit(e: SubmitEvent) {
		e.preventDefault();
		this.formHelper.submit()
	}

	async selectVaultPath() {
		const path = await this.filesAPI.selectVaultLocation()
		if (path) {
			this.formHelper.onChange("folderPath", path)
		}
	}

	render() {
		render(html`
			<div>
				<button @click=${() => {this.navigateVaultManager({type: "list"})}}>All vaults</button>
				<h3>Create new vault</h3>
				<div>
					<form @submit=${this.onSubmit.bind(this)}>
						<div>
							<label for="name">Display Name</label>
							${observe(this.formHelper.fields.displayName, (field) => html`
								<input
									id="name"
									name="name"
									placeholder="Example Vault"
									value=${field.value}
									@input=${(e: Event) => this.formHelper.onChange("displayName", (e.currentTarget as HTMLInputElement).value)}
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
										this.formHelper.fields.folderPath,
										(field) => html`<p>${field.value && field.touched ? this.filesAPI.getPathDisplay(field.value) : "No Folder Selected"}</p>`,
									)}
										<button type="button" onClick=${this.selectVaultPath}>Select Location</button>
									</div>
								`,
								() => html`<p>Vault location is not user managed on this platform. Try the desktop or mobile app for more control over your files.</p>`,
							)}
						</div>
						${observe(this.formHelper.root.error, (error) => error ? html`<p>${error}</p>`: nothing)}
						<button type="submit">Create vault</button>
					</form>
				</div>
			</div>
		`, this)
	}
}
