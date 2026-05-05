import {For} from "solid-js";
import type {IFileSystemTreeItem} from "../../../02-apis/files/files.api";
import {useWorkspace} from "../workspace/workspace.context";


export interface FileTreeItemProps {
	item: IFileSystemTreeItem
}

export function FileTreeItem(props: FileTreeItemProps) {
	const { openTab } = useWorkspace()

	function openFileTab(path: string) {
		openTab({type: "file", path})
	}

	function openFileExplorerTab(path: string) {
		openTab({type: "file-explorer", path})
	}

	if (props.item.type === "file") {
		return (
			<div>
				<button onClick={() => {openFileTab(props.item.path)}}>{props.item.name}</button>
			</div>
		)
	}

	return (
		<details>
			<summary>
				<button onClick={() => {openFileExplorerTab(props.item.path)}}>{props.item.name}</button>
			</summary>
			<div style={{"padding-left": "15px"}}>
				<For each={props.item.children}>
					{(item) => (
						<FileTreeItem item={item} />
					)}
				</For>
			</div>
		</details>
	)
}
