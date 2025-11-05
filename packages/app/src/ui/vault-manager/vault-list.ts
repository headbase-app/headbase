import {html} from "lit";
import {customElement, property} from "lit/decorators.js";
import {consume} from "@lit/context";

import {i18nAPIContext} from "@/framework/context.ts";
import type {I18nAPI} from "@api/i18n/i18n.api.ts";
import {LightDomLitElement} from "@utils/light-dom-lit-element.ts";

@customElement("vault-list")
export class VaultList extends LightDomLitElement {
	@consume({context: i18nAPIContext})
	@property({ attribute: false })
	private i18nAPI!: I18nAPI;

	private dispatchCreate() {
		document.dispatchEvent(new CustomEvent("VaultManager_trigger", {detail: {type: "create"}}))
	}

	private dispatchEdit(id: string) {
		document.dispatchEvent(new CustomEvent("VaultManager_trigger", {detail: {type: "edit", id}}))
	}

	protected override render() {
		return html`
			<div>
				<button @click=${() => this.dispatchCreate()}>${this.i18nAPI.t("Create vault")}</button>
				<ul>
					<li><p>Vault 1</p><button @click=${() => {this.dispatchEdit("vault-1")}}>edit</button></li>
					<li><p>Vault 2</p><button @click=${() => {this.dispatchEdit("vault-2")}}>edit</button></li>
					<li><p>Vault 3</p><button @click=${() => {this.dispatchEdit("vault-3")}}>edit</button></li>
					<li><p>Vault 4</p><button @click=${() => {this.dispatchEdit("vault-4")}}>edit</button></li>
				</ul>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'vault-list': VaultList
	}
}
