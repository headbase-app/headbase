import {html, type TemplateResult} from "lit-html";
import {repeat} from "lit-html/directives/repeat.js";
import {BehaviorSubject, of, switchMap} from "rxjs";

import {useContext} from "../../../03-framework/context";
import {FilesAPIContext, WorkspaceVaultAPIContext} from "../../../03-framework/contexts";
import {BaseElement} from "../../../03-framework/base-element";
import {LIVE_QUERY_EMPTY, type LiveQueryResult} from "../../../01-common/control-flow";
import {type IFileSystemTree} from "../../../02-apis/files/files.api";


export class FileExplorer extends BaseElement {
	static tag = "hb-file-explorer"
	workspaceVaultAPI = useContext(WorkspaceVaultAPIContext)
	filesAPI = useContext(FilesAPIContext)
	path?: string
	fileTree: BehaviorSubject<LiveQueryResult<IFileSystemTree | null>>

	constructor() {
		super();
		this.fileTree = this.createState(LIVE_QUERY_EMPTY, this.workspaceVaultAPI.liveGet().pipe(
			switchMap(vaultQuery => {
				if (vaultQuery.status === "success" && vaultQuery.result) {
					return this.filesAPI.liveTree(this.path ?? "/")
				}
				return of(LIVE_QUERY_EMPTY)
			}),
		))
	}

	render() {
		let content: TemplateResult;
		if (this.fileTree.value.status === "success" && this.fileTree.value.result) {
			if (this.fileTree.value.result.children.length > 0) {
				content = html`${repeat(
					this.fileTree.value.result.children,
					(fileItem) => fileItem.path,
					(fileItem) => html`
						<hb-file-tree-item .item=${fileItem}></hb-file-tree-item>
					`
				)}`
			}
			else {
				content = html`<p>No Files Found</p>`
			}
		}
		else if (this.fileTree.value.status === "error") {
			this.fileTree.value.errors.forEach(console.error)
			content = html`
				<p>An error has occurred: ${this.fileTree.value.errors.toString()}</p>
			`
		} else {
			content = html`<p>Loading...</p>`
		}

		return html`
			<div>
				<div>
					<button onClick={openNewTab}>open in tab</button>
				</div>
				<div>
					${content}
				</div>
			</div>
		`
	}
}
