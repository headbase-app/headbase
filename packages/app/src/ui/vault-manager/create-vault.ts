import {customElement, property} from "lit/decorators.js";
import {html, LitElement} from "lit";
import {consume} from "@lit/context";
import {i18nAPIContext, vaultsAPIContext} from "@/framework/context.ts";
import type {I18nAPI} from "@api/i18n/i18n.api.ts";
import type {VaultsAPI} from "@api/vaults/vaults.api.ts";
import type {CreateVaultDto} from "@contracts/vaults.ts";

import "./vault-form.ts"

@customElement("create-vault")
export class CreateVault extends LitElement {
	@consume({context: i18nAPIContext})
	@property({ attribute: false })
	private i18nAPI!: I18nAPI;

	@consume({context: vaultsAPIContext})
	@property({ attribute: false })
	private vaultsAPI!: VaultsAPI;

	onCreateBound: CreateVault['onCreate']

	constructor() {
		super();
		this.onCreateBound = this.onCreate.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		document.addEventListener("create-vault", this.onCreateBound);
	}
	disconnectedCallback() {
		document.removeEventListener("create-vault", this.onCreateBound);
	}

	private onCreate(e: CustomEvent<CreateVaultDto>) {
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
				<h2>${this.i18nAPI.t("Create Vault")}</h2>
				<vault-form></vault-form>
			</div>
		`
	}
}
