import {createEffect, For, Show} from "solid-js";
import {createStore} from "solid-js/store";

import type {FileSystemDirectory, FileSystemItem} from "@api/files/files.interface.ts";
import {useFilesAPI} from "@/framework/files.context.ts";
import {useCurrentVaultService} from "@/framework/current-vault.context.ts";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult} from "@contracts/query.ts";
import type {LocalVaultDto} from "@api/vaults/local-vault.ts";

import "./file-system-explorer.css"
import {useWorkspace} from "@/framework/workspace/workspace.context.ts";


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
	const currentVaultService = useCurrentVaultService();
	const [openVaultQuery, setOpenVaultQuery] = createStore<LiveQueryResult<LocalVaultDto|null>>(structuredClone(LIVE_QUERY_LOADING_STATE))
	createEffect(() => {
		const subscription = currentVaultService.liveGet((result) => {
			console.debug("FileSystemExplorer/openVaultQuery", result)
			setOpenVaultQuery(result)
		})
		return () => {subscription.unsubscribe()}
	})
	const openVault = () => {return openVaultQuery.status === "success" ? openVaultQuery.result : null}


	const filesApi = useFilesAPI()
	const [fileTree, setFileTree] = createStore<LiveQueryResult<FileSystemDirectory | null>>(structuredClone(LIVE_QUERY_LOADING_STATE))
	createEffect(() => {
		const vaultId = openVault()?.id
		if (vaultId) {
			const filesSubscription = filesApi.liveTree(vaultId, (result) => {
				console.debug("FileSystemExplorer/fileTree", result)
				setFileTree(result)
			})
			return () => filesSubscription.unsubscribe()
		}
	})

	return (
		<div>
			<p>File explorer:</p>
			<Show when={!openVault()?.id}>
				<p>Open vault to display files</p>
			</Show>
			<Show when={openVault()?.id && fileTree.status === 'loading'}>
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
			<Show when={fileTree.status === 'success' && fileTree} keyed>
				{(fileTree) => (
					<For each={fileTree.result?.children}>
						{(item) => (
							<FileSystemItem {...item} />
						)}
					</For>
				)}
			</Show>
		</div>
	)
}
