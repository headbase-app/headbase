import {html} from "lit-html";
import {BaseElement} from "../../03-framework/base-element";

export class SplashPage extends BaseElement {
	static tag = "hb-page-splash"

	render() {
		return html`<p>Splash</p>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[SplashPage.tag]: SplashPage
	}
}
