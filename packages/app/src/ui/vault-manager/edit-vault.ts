import {customElement, property, state} from "lit/decorators.js";
import {html, LitElement} from "lit";
import {consume} from "@lit/context";
import {i18nAPIContext, vaultsAPIContext} from "@/framework/context.ts";
import type {I18nAPI} from "@api/i18n/i18n.api.ts";
import type {VaultsAPI} from "@api/vaults/vaults.api.ts";
import type {CreateVaultDto, LocalVaultDto} from "@contracts/vaults.ts";

import "./vault-form.ts"

@customElement("edit-vault")
export class EditVault extends LitElement {
	@consume({context: i18nAPIContext})
	@property({ attribute: false })
	private i18nAPI!: I18nAPI;

	@consume({context: vaultsAPIContext})
	@property({ attribute: false })
	private vaultsAPI!: VaultsAPI;

	@property()
	vaultId!: string;

	@state() vault: LocalVaultDto|null = null;

	onEditBound: EditVault['onEdit']

	constructor() {
		super();
		this.onEditBound = this.onEdit.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		document.addEventListener("edit-vault", this.onEditBound);

		this.vaultsAPI.get(this.vaultId)
			.then(result => {this.vault = result;})
	}
	disconnectedCallback() {
		document.removeEventListener("edit-vault", this.onEditBound);
	}

	private onEdit(e: CustomEvent<CreateVaultDto>) {
		e.preventDefault()
		this.vaultsAPI.create(e.detail)
	}

	private onBack() {
		document.dispatchEvent(new CustomEvent("VaultManager_trigger", {detail: {type: "list"}}))
	}

	render() {
		return html`
			<div>
				<button @click=${() => this.onBack()}>All vaults</button>
				<h2>${this.i18nAPI.t("Edit Vault")}</h2>
				${this.vault
					? html`<vault-form></vault-form>`
					: html`<p>${this.i18nAPI.t("Loading...")}</p>`
				}
				<p>${this.vaultId}</p>
				<vault-form></vault-form>
			</div>
		`
	}
}
