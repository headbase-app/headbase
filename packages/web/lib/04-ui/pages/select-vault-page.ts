import {html, render} from "lit-html";
import {BaseElement} from "../../03-framework/base-element";

export class SelectVaultPage extends BaseElement {
	static tag = "hb-page-select-vault"

	render() {
		return html`
			<h1>Select Vault</h1>
			<hb-vault-manager></hb-vault-manager>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hb-page-select-vault': SelectVaultPage
	}
}
