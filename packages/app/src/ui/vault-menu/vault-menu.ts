import {html} from "lit";
import {createRef, ref, type Ref} from "lit-html/directives/ref.js";
import {consume} from "@lit/context";
import {customElement, property} from "lit/decorators.js";
import {ChevronDown, createElement} from "lucide";

import type {I18nAPI} from "@api/i18n/i18n.api.ts";
import {i18nAPIContext} from "@/framework/context.ts";
import {LightDomLitElement} from "@utils/light-dom-lit-element.ts";

import "./vault-menu.css"
import type {LocalVaultDto} from "@contracts/vaults.ts";

@customElement("vault-menu")
export class VaultMenu extends LightDomLitElement {
	@property()
	currentVault: LocalVaultDto | null = null;

	@consume({context: i18nAPIContext})
	@property({ attribute: false })
	private i18nAPI!: I18nAPI;

	#vaultMenuPopover: Ref<HTMLDivElement> = createRef();

	#openVaultManager() {
		document.dispatchEvent(new CustomEvent("VaultManager_trigger", {detail: {type: "list"}}))
	}

	render() {
		const label = this.currentVault ? this.currentVault.displayName : this.i18nAPI.t("Open Vault")

		return html`
			<div class="vault-menu">
				<button popovertarget="vault-switcher">${label}</button>
				${createElement(ChevronDown)}
			</div>
			<div class="vault-switcher" popover id="vault-switcher" ${ref(this.#vaultMenuPopover)}>
				<h3>Vault switcher</h3>
				<button>test 1</button>
				<button>test 2</button>
				<button @click=${() => this.#openVaultManager()}>open manager</button>
			</div>
		`
	}
}

export type VaultMenuProps = Omit<Omit<VaultMenu, keyof HTMLElement>, keyof LightDomLitElement>

declare global {
	interface HTMLElementTagNameMap {
		'vault-menu': VaultMenu
	}
}
