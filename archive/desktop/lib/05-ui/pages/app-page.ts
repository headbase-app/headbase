import {html} from "lit-html";
import {BaseElement} from "../../03-framework/base-element";


export class AppPage extends BaseElement {
	static tag = "hb-page-app"

	render() {
		return html`
			<div>
				<hb-vault-menu></hb-vault-menu>
				<hb-workspace></hb-workspace>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[AppPage.tag]: AppPage
	}
}
