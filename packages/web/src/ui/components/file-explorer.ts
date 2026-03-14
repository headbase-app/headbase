import {html} from "lit";
import {consume} from "@lit/context";
import {state} from "lit/decorators.js";
import {of, switchMap} from "rxjs";

import {
	BaseElement,
	FilesAPIContext,
	type IFilesAPI, type IFileSystemTree,
	type IWorkspaceVaultAPI, type LiveQueryResult, ObservableProperty,
	WorkspaceVaultAPIContext
} from "@headbase-app/lib";


export class FileExplorer extends BaseElement {
	static tag = "hb-file-explorer"
	@consume({context: WorkspaceVaultAPIContext}) workspaceVaultAPI!: IWorkspaceVaultAPI
	@consume({context: FilesAPIContext}) filesAPI!: IFilesAPI

	@state() fileTree?: LiveQueryResult<IFileSystemTree | null>
	fileTree$!: ObservableProperty<LiveQueryResult<IFileSystemTree | null> | undefined>

	connectedCallback() {
		super.connectedCallback();
		this.fileTree$ = new ObservableProperty(this, this.workspaceVaultAPI.liveGet().pipe(
			switchMap(vaultQuery => {
				if (vaultQuery.status === "success" && vaultQuery.result) {
					return this.filesAPI.liveTree(vaultQuery.result.path)
				}
				return of(undefined)
			})
		))
	}

	render() {
		console.debug('render hb-file-explorer')
		return html`<p>hb-file-explorer</p>`
	}
}
