import {html} from "lit-html";
import {repeat} from "lit-html/directives/repeat.js";

import {BaseElement} from "../../../03-framework/base-element";
import {IFileSystemTreeItem} from "../../../02-apis/files/files.api";
import {styleMap} from "lit-html/directives/style-map.js";
import {useContext} from "../../../03-framework/context.ts";
import {WorkspaceAPIContext} from "../../../03-framework/contexts.ts";


export class FileTreeItem extends BaseElement {
	static tag = "hb-file-tree-item"
	item!: IFileSystemTreeItem
	workspaceAPI = useContext(WorkspaceAPIContext)

	render() {
		if (this.item.type === "file") {
			return html`
				<div>
					<button @click=${() => {this.workspaceAPI.openTab({type: "file", path: this.item.path})}}>${this.item.name}</button>
				</div>
			`
		}

		return html`
			<details>
				<summary>
					<button @click=${() => {this.workspaceAPI.openTab({type: "file-explorer", path: this.item.path})}}>${this.item.name}</button>
				</summary>
				<div style=${styleMap({"padding-left": "15px"})}>
					${repeat(
						this.item.children,
						(fileItem => fileItem.path),
						(fileItem) => html`
							<hb-file-tree-item .item=${fileItem}></hb-file-tree-item>
						`
					)}
				</div>
			</details>
		`
	}
}
