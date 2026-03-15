import {html, render} from "lit-html";
import {of,switchMap} from "rxjs";

import {
	BaseElement, FilesAPIContext,
	type IFileSystemTree,
	LIVE_QUERY_EMPTY, type LiveQueryResult, routes,
	WorkspaceVaultAPIContext,
} from "@headbase-app/lib";
import { useContext } from "@headbase-app/lib"
import {CurrentPageContext} from "../../app.ts";

export class FileExplorer extends BaseElement {
	static tag = "hb-file-explorer"
	workspaceVaultAPI = useContext(WorkspaceVaultAPIContext)
	filesAPI = useContext(FilesAPIContext)
	currentPage = useContext(CurrentPageContext)
	fileTree: LiveQueryResult<IFileSystemTree | null>

	constructor() {
		super();
		this.fileTree = LIVE_QUERY_EMPTY
		this.observedState("fileTree", this.workspaceVaultAPI.liveGet().pipe(
			switchMap(vaultQuery => {
				if (vaultQuery.status === "success" && vaultQuery.result) {
					return this.filesAPI.liveTree(vaultQuery.result.path)
				}
				return of(LIVE_QUERY_EMPTY)
			}),
		))
	}

	selectVault() {
		console.debug("ONCLICK")
		this.currentPage.next(routes.selectVault)
	}

	render() {
		render(html`
			<p>hb-file-explorer</p>
			<button @click=${this.selectVault.bind(this)}>select vault</button>
		`, this)
	}
}
