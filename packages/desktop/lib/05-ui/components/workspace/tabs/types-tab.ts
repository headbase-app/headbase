import {html, nothing, TemplateResult} from "lit-html";
import {BaseElement} from "@headbase-app/lib";

export class TypesTab extends BaseElement {
	static tag = "hb-types-tab";

	path?: string

	render(): TemplateResult | typeof nothing {
		return html`<p>Types Tab</p>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[TypesTab.tag]: TypesTab
	}
}
