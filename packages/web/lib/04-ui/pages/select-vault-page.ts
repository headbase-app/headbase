import {html} from "lit";
import {customElement} from "lit/decorators.js";
import {BaseElement} from "../../03-framework/base-element";

@customElement("hb-select-vault-page")
export class SelectVaultPage extends BaseElement {
	render() {
		return html`<p>Select Vault</p>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hb-select-vault-page': SelectVaultPage
	}
}
