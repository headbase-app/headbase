import {html, nothing, TemplateResult} from "lit-html";
import {BaseElement} from "@headbase-app/lib";

export class FileExplorerTab extends BaseElement {
	static tag = "hb-file-explorer-tab";

	path?: string

	render(): TemplateResult | typeof nothing {
		return html`<hb-file-explorer .path=${this.path}></hb-file-explorer>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[FileExplorerTab.tag]: FileExplorerTab
	}
}
