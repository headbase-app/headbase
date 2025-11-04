import {html, render} from "lit-html";
import {createRef, ref, type Ref} from "lit-html/directives/ref.js";
import {ChevronDown, createElement} from "lucide";

import {I18nService} from "../../services/i18n.ts";

import "./vault-menu.css"


export class VaultMenu {
	container: HTMLDivElement
	vaultMenuPopover: Ref<HTMLDivElement> = createRef();

	openVaultMenuBound: VaultMenu['openVaultMenu']

	constructor(
		container: HTMLDivElement,
		private readonly i18n: I18nService
	) {
		this.container = container

		this.openVaultMenuBound = this.openVaultMenu.bind(this)
	}

	init(){
		this.render()
	}

	openVaultMenu() {
		console.debug("VaultManager_trigger sent")
		document.dispatchEvent(new CustomEvent("VaultManager_trigger"))
	}

	render() {
		const openVault: string|null = null

		const label = openVault ? openVault : this.i18n.t("vaultMenu.open")
		return render(html`
			<div class="vault-menu">
				<button popovertarget="vault-switcher">${label}</button>
				${createElement(ChevronDown)}
			</div>
			<div class="vault-switcher" popover id="vault-switcher" ${ref(this.vaultMenuPopover)}>
				<h3>Vault switcher</h3>
				<button>test 1</button>
				<button>test 2</button>
				<button @click=${this.openVaultMenuBound}>open vault manager</button>
			</div>
		`, this.container)
	}
}
