import {html} from "lit-html";
import {repeat} from "lit-html/directives/repeat.js";

import {BaseElement} from "../../../03-framework/base-element";
import {IFileSystemTreeItem} from "../../../02-apis/files/files.api";


export class FileTreeItem extends BaseElement {
	static tag = "hb-file-tree-item"
	item!: IFileSystemTreeItem

	openFileTab(path: string) {
		// openTab({type: "file", path})
	}

	openFileExplorerTab(path: string) {
		// openTab({type: "file-explorer", path})
	}

	render() {
		if (this.item.type === "file") {
			return html`
				<div>
					<button @click=${() => {this.openFileTab(this.item.path)}}>${this.item.name}</button>
				</div>
			`
		}

		return html`
			<details>
				<summary>
					<button @click=${() => {this.openFileExplorerTab(this.item.path)}}>${this.item.name}</button>
				</summary>
				<div style={{"padding-left": "15px"}}>
				${repeat(
					this.item.children,
					(fileItem => fileItem.path),
					(fileItem) => html`
						<hb-file-tree-item .item=${fileItem}></hb-file-tree-item>
					`
				)}
				<For each={props.item.children}>
					{(item) => (
					<FileTreeItem item={item} />
					)}
				</For>
				</div>
			</details>
		`
	}
}
