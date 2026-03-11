import {html} from "lit";
import {customElement} from "lit/decorators.js";
import {BaseElement} from "../../03-framework/base-element";


@customElement("hb-app-page")
export class AppPage extends BaseElement {
	render() {
		return html`<p>App Page</p>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hb-app-page': AppPage
	}
}
