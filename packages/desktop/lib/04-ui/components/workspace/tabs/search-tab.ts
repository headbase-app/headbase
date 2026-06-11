import {html, nothing, TemplateResult} from "lit-html";
import {BaseElement} from "@headbase-app/lib";

export class SearchTab extends BaseElement {
	static tag = "hb-search-tab";

	path?: string

	render(): TemplateResult | typeof nothing {
		return html`<p>Search Tab</p>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[SearchTab.tag]: SearchTab
	}
}
