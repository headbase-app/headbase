import {html, render} from "lit-html";
import {BaseElement} from "../../03-framework/base-element";

export class AppPage extends BaseElement {
	static tag = "hb-page-app"
	render() {
		render(html`<p>App Page</p>`, this)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hb-page-app': AppPage
	}
}
