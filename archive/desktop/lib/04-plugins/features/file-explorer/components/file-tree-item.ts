import {html} from "lit-html";
import {repeat} from "lit-html/directives/repeat.js";
import {styleMap} from "lit-html/directives/style-map.js";

import {BaseElement} from "../../../../03-framework/base-element.ts";
import {IFileSystemTreeItem} from "../../../../02-apis/files/files.api.ts";
import {useContext} from "../../../../03-framework/context.ts";
import {WorkspaceAPIContext} from "../../../../03-framework/contexts.ts";
import {FILE_EXPLORER_WORKSPACE_ID} from "../file-explorer.workspace.ts";
import {FILE_EDITOR_WORKSPACE_ID} from "../../file-editor/file-editor.workspace.ts";


export class FileTreeItem extends BaseElement {
	static tag = "hb-file-tree-item"
	item!: IFileSystemTreeItem
	workspaceAPI = useContext(WorkspaceAPIContext)

	render() {
		if (this.item.type === "file") {
			return html`
				<div>
					<button @click=${() => {this.workspaceAPI.open({type: "plugin", plugin: FILE_EDITOR_WORKSPACE_ID, data: [this.item.path]})}}>${this.item.name}</button>
				</div>
			`
		}

		// todo: need a better way of code depending on plugin id here?
		return html`
			<details>
				<summary>
					<button @click=${() => {this.workspaceAPI.open({type: "plugin", plugin: FILE_EXPLORER_WORKSPACE_ID, data: [this.item.path]})}}>${this.item.name}</button>
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
