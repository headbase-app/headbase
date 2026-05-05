import {from, Switch, Match, Show, For} from "solid-js";
import {of, switchMap} from "rxjs";

import {useWorkspace} from "../workspace/workspace.context";
import {useWorkspaceVaultAPI} from "../../../03-framework/workspace-vault.context";
import {useFilesAPI} from "../../../03-framework/files-api.context";
import {FileTreeItem} from "./file-tree-item";


export interface FileExplorerProps {
	path?: string
}

export function FileExplorer(props?: FileExplorerProps) {
	const {openTab} = useWorkspace()
	const workspaceVaultAPI = useWorkspaceVaultAPI()
	const filesAPI = useFilesAPI()

	const fileTreeQuery = from(workspaceVaultAPI.liveGet().pipe(
		switchMap(vaultQuery => {
			if (vaultQuery.status === "success" && vaultQuery.result) {
				// todo: use proper path joining
				const path = props?.path ? props.path : vaultQuery.result.path
				return filesAPI.liveTree(path)
			}
			return of(null)
		})
	))

	function openNewTab() {
		openTab({type: "file-explorer", path: props?.path})
	}

	return (
		<div>
			<div>
				<button onClick={openNewTab}>open in tab</button>
			</div>
			<Switch>
				<Match
					when={(() => {
						const fileTree = fileTreeQuery();
						return fileTree?.status === 'success' && fileTree.result
					})()}
					keyed
				>
					{(fileTree) => (
						<>
							<Show when={fileTree.children.length > 0} fallback={<p>No files found</p>}>
								<For each={fileTree.children}>
									{item => <FileTreeItem item={item} />}
								</For>
							</Show>
						</>
					)}
				</Match>
				<Match
					when={(() => {
						const fileTree = fileTreeQuery();
						return fileTree?.status === 'loading'
					})()}
					keyed
				>
					<p>Loading files...</p>
				</Match>
				<Match when={!fileTreeQuery()}>
					<p>Open a vault to display files.</p>
				</Match>
			</Switch>
		</div>
	)
}
