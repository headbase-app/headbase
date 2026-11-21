import {html, nothing} from "lit-html";
import {when} from "lit-html/directives/when.js";

import {
	BaseElement,
	useContext,
	type FormErrors,
	FormHelper,
	observe,
	dispatchEvent,
	DatabaseManagerAPIContext
} from "@headbase-app/lib";
import type {DatabaseManagerEvents} from "./database-manager.ts";

export interface DatabaseFormFields {
	id: string
	displayName: string
	path: string
}

export class DatabaseForm extends BaseElement {
	static tag = "hb-database-form"

	databaseManagerAPI = useContext(DatabaseManagerAPIContext)

	initialValues?: DatabaseFormFields
	formHelper!: FormHelper<DatabaseFormFields>

	onSubmit!: (values: DatabaseFormFields) => void
	title!: string
	submitText!: string

	constructor() {
		super()
		this.formHelper = new FormHelper<DatabaseFormFields>(this.initialValues ?? {id: "", displayName: "", path: ""}, {
			validate: (values) => {
				const errors: FormErrors<DatabaseFormFields> = {fields: {}}
				if (values.displayName.length === 0) {
					errors.fields.displayName = "Display name is required"
				}
				if (this.databaseManagerAPI.isLocationSelectable()) {
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

	async selectDatabasePath() {
		const path = await this.databaseManagerAPI.selectLocation()
		if (path) {
			this.formHelper.setField("path", path)
		}
	}

	render() {
		return html`
			<div>
				<button @click=${() => {dispatchEvent<DatabaseManagerEvents>(this, "database-manager:navigate", {type: "list"})}}>All Databases</button>
				<h3>${this.title}</h3>
				<div>
					<form @submit=${this.formHelper.submit.bind(this.formHelper)}>
						<div>
							<label for="name">Display Name</label>
							${observe(this.formHelper.fields.displayName, (field) => html`
								<input
									id="name"
									name="name"
									placeholder="Example Database"
									value=${field.value}
									@input=${(e: Event) => this.formHelper.setField("displayName", (e.currentTarget as HTMLInputElement).value)}
									@blur=${() => this.formHelper.onBlur("displayName")}
								/>
								${field.error && field.touched && field.blurred ? html`<p>${field.error}</p>`: nothing}
							`)}
						</div>
						<div>
							<label for="id">Identifier</label>
							${observe(this.formHelper.fields.id, (field) => html`
								<input
									id="id"
									name="id"
									placeholder="Identifier"
									value=${field.value}
									@input=${(e: Event) => this.formHelper.setField("id", (e.currentTarget as HTMLInputElement).value)}
									@blur=${() => this.formHelper.onBlur("id")}
								/>
								${field.error && field.touched && field.blurred ? html`<p>${field.error}</p>`: nothing}
							`)}
						</div>
						<div>
							<label>Database Location</label>
							${when(
								this.databaseManagerAPI.isLocationSelectable(),
								() => html`
									<div>
										${observe(
										this.formHelper.fields.path,
										(field) => html`<p>${field.value && field.touched ? field.value : "No Folder Selected"}</p>`,
									)}
										<button type="button" @click=${this.selectDatabasePath.bind(this)}>Select Location</button>
									</div>
								`,
								() => html`<p>Database location is not user managed on this platform. Use the desktop app to save to a custom location.</p>`,
							)}
						</div>
						${observe(this.formHelper.root.error, (error) => error ? html`<p>${error}</p>`: nothing)}
						<button type="submit">${this.submitText}</button>
					</form>
				</div>
			</div>
		`
	}
}
