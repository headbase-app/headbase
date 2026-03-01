import {useWorkspaceVaultAPI} from "@framework/workspace-vault.context.ts";
import {from, Switch, Match, createSignal, createEffect, Show, For} from "solid-js";
import type {IFileSystemTree} from "@headbase-app/libweb";
import {useFilesAPI} from "@framework/files-api.context.ts";
import {useWorkspace} from "@ui/03-features/workspace/workspace.context.ts";
import {FileTreeItem} from "@ui/03-features/file-explorer/file-tree-item.tsx";

export interface FileExplorerProps {
	path?: string
}

export function FileExplorer(props?: FileExplorerProps) {
	const {openTab} = useWorkspace()
	const currentVaultService = useWorkspaceVaultAPI()
	const filesAPI = useFilesAPI()
	const openVaultQuery = from(currentVaultService.liveGet())
	const openVault = () => {
		const query = openVaultQuery()
		if (query?.status === "success") return query.result
		return null
	}

	const [fileTree, setFileTree] = createSignal<IFileSystemTree|null>(null)
	createEffect(async () => {
		const vault = openVault()
		if (vault) {
			const tree = await filesAPI.tree(props?.path ?? vault.path)
			setFileTree(tree)
		}
	})

	function openNewTab() {
		openTab({type: "file-explorer", path: props?.path})
	}

	return (
		<div>
			<div>
				<button onClick={openNewTab}>open in tab</button>
			</div>
			<Switch>
				<Match when={fileTree()} keyed>
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
				<Match when={!fileTree()}>
					<p>Open a vault to display files.</p>
				</Match>
			</Switch>
		</div>
	)
}
