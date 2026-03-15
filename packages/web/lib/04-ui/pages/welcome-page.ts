import {html, render} from "lit-html";
import {BaseElement} from "../../03-framework/base-element";

export class WelcomePage extends BaseElement {
	static tag = "hb-page-welcome"
	render() {
		render(html`<p>Welcome Page</p>`, this)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hb-page-welcome': WelcomePage
	}
}
