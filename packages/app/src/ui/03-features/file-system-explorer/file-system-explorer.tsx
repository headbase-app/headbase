import {For, Show} from "solid-js";

import type {FileSystemItem} from "@api/files/files.interface.ts";

import "./file-system-explorer.css"
import {useWorkspace} from "@/framework/workspace/workspace.context.ts";
import {ImportFileForm} from "@ui/03-features/file-system-explorer/import-file-form.tsx";
import {useCurrentVault} from "@/framework/use-current-vault.ts";
import {useFileTree} from "@/framework/use-file-tree.ts";

export function FileSystemItem(props: FileSystemItem) {
	const { openTab } = useWorkspace()

	if (props.type === "file") {
		return (
			<button
				class="file-explorer__file"
				onClick={() => {
					openTab({type: "file", filePath: props.path})
				}}
			>
				{props.name}
			</button>
		)
	}

	return (
		<div class="file-explorer__folder">
			<div class="file-explorer__folder-name" data-path={props.path}>
				<button>{props.name}</button>
			</div>
			<div class="file-explorer__folder-children" style={{"padding-left": "20px"}}>
				<For each={props.children}>
					{(item) => (
						<FileSystemItem {...item} />
					)}
				</For>
			</div>
		</div>
	)
}

export function FileSystemExplorer() {
	const currentVault = useCurrentVault()
	const fileTree = useFileTree()

	let importDialog!: HTMLDialogElement;
	const openImportDialog = () => {importDialog?.showModal()}
	const closeImportDialog = () => {importDialog?.close()}

	return (
		<div>
			<button onClick={openImportDialog}>import</button>
			<dialog ref={importDialog}>
				<ImportFileForm onClose={closeImportDialog}/>
			</dialog>

			<Show when={currentVault.status === 'success' && currentVault.result && fileTree.status === 'loading'}>
				<p>Loading files...</p>
			</Show>
			<Show when={fileTree.status === 'error' && fileTree} keyed>
				{(query) => (
					<>
						<p>An error occurred</p>
						<p>{query.errors.join(",")}</p>
					</>
				)}
			</Show>
			<Show when={currentVault.status === 'success' && !currentVault.result}>
				<p>Open vault to display files</p>
			</Show>
			<Show when={fileTree.status === 'success' && fileTree.result?.children.length === 0} keyed>
				<p>No files found</p>
			</Show>
			<Show when={fileTree.status === 'success' && fileTree} keyed>
				{(fileTree) => (
					<div>
						<For each={fileTree.result?.children}>
							{(item) => (
								<FileSystemItem {...item} />
							)}
						</For>
					</div>
				)}
			</Show>
		</div>
	)
}
