import {html} from "lit";
import {customElement} from "lit/decorators.js";
import {BaseElement} from "../../03-framework/base-element";

@customElement("hb-welcome-page")
export class WelcomePage extends BaseElement {
	render() {
		return html`<p>Welcome Page</p>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hb-welcome-page': WelcomePage
	}
}
