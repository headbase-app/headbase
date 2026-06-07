import {html} from "lit-html";
import {BaseElement} from "../../03-framework/base-element";
import {useContext} from "../../03-framework/context.ts";
import {WorkspaceVaultAPIContext} from "../../03-framework/contexts.ts";

export class AppPage extends BaseElement {
	static tag = "hb-page-app"
	workspaceVaultAPI = useContext(WorkspaceVaultAPIContext)

	render() {
		return html`
			<div>
				<hb-vault-menu></hb-vault-menu>
				<button @click=${() => {this.workspaceVaultAPI.close()}}>Close vault</button>
				<p>App Page</p>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[AppPage.tag]: AppPage
	}
}
