import {html} from "lit-html";
import {BaseElement} from "../../03-framework/base-element";

export class ManageVaultsPage extends BaseElement {
	static tag = "hb-page-manage-vaults"

	render() {
		return html`
			<h1>Select Vault</h1>
			<hb-vault-manager></hb-vault-manager>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[ManageVaultsPage.tag]: ManageVaultsPage
	}
}
