import {html, render} from "lit-html";
import {BaseElement} from "../../03-framework/base-element";

export class SelectVaultPage extends BaseElement {
	static tag = "hb-page-select-vault"
	render() {
		render(html`<p>Select Vault</p>`, this)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hb-page-select-vault': SelectVaultPage
	}
}
