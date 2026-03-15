import {html, render} from "lit-html";
import {of,switchMap} from "rxjs";
import {useContext} from "../../../03-framework/context";
import {FilesAPIContext, WorkspaceVaultAPIContext} from "../../../03-framework/contexts";
import {BaseElement} from "../../../03-framework/base-element";
import {LIVE_QUERY_EMPTY, LiveQueryResult} from "../../../01-common/control-flow";
import {IFileSystemTree} from "../../../02-apis/files/files.api";

export class FileExplorer extends BaseElement {
	static tag = "hb-file-explorer"
	workspaceVaultAPI = useContext(WorkspaceVaultAPIContext)
	filesAPI = useContext(FilesAPIContext)
	fileTree: LiveQueryResult<IFileSystemTree | null>

	constructor() {
		super();
		this.fileTree = LIVE_QUERY_EMPTY
		this.reflectObservable("fileTree", this.workspaceVaultAPI.liveGet().pipe(
			switchMap(vaultQuery => {
				if (vaultQuery.status === "success" && vaultQuery.result) {
					return this.filesAPI.liveTree(vaultQuery.result.path)
				}
				return of(LIVE_QUERY_EMPTY)
			}),
		))
	}

	render() {
		render(html`
			<p>hb-file-explorer</p>
		`, this)
	}
}
