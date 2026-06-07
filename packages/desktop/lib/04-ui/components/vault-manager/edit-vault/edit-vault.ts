import {html} from "lit-html";

import {BaseElement} from "../../../../03-framework/base-element";
import {useContext} from "../../../../03-framework/context";
import {VaultsAPIContext} from "../../../../03-framework/contexts";
import {dispatchEvent} from "../../../../03-framework/events";
import type {VaultManagerEvents} from "../vault-manager";
import type {VaultFormFields} from "../vault-form.ts";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult, type VaultDto} from "@headbase-app/lib";
import type {BehaviorSubject} from "rxjs";

export class EditVault extends BaseElement {
	static tag = "hb-edit-vault"
	vaultsAPI = useContext(VaultsAPIContext)

	static observedAttributes = ["vaultId"]
	get vaultId() {return this.getAttribute("vaultId") as string}

	vault$!: BehaviorSubject<LiveQueryResult<VaultDto | null>>

	connectedCallback() {
		this.vault$ = this.createState(LIVE_QUERY_LOADING_STATE, this.vaultsAPI.liveGet(this.vaultId))
	}

	async onSubmit(values: VaultFormFields) {
		await this.vaultsAPI.update(this.vaultId, values)
		dispatchEvent<VaultManagerEvents>(this, "vault-manager:navigate", {type: "list"})
	}

	render() {
		if (this.vault$.value.status === "loading") {
			return html`<p>Loading vault...</p>`
		}
		else if (this.vault$.value.status === "error") {
			return html`<p>An error occurred while loading the vault: ${this.vault$.value.errors.join(",")}</p>`
		}
		else if (this.vault$.value.result === null) {
			return html`
				<div>
					<button @click=${() => dispatchEvent<VaultManagerEvents>(this, "vault-manager:navigate", {type: "list"})}>All vaults</button>
					<p>Vault Not Found</p>
				</div>
			`
		}

		return html`
			<hb-vault-form
				.title="Edit vault '${this.vault$.value.result.displayName}'"
				.submitText=${"Update vault"}
				.initialValues=${{
					displayName: this.vault$.value.result.displayName,
					path: this.vault$.value.result.path
				}}
				.onSubmit=${this.onSubmit.bind(this)}
			></hb-vault-form>
		`
	}
}
