import {OPFSXDirectoryTree, OPFSXFile} from "opfsx";
import {useWorkspaceContext} from "../workspace/workspace-context.tsx";
import {useHeadbase} from "../../../headbase/hooks/use-headbase.tsx";
import {useFileTree} from "../../../headbase/hooks/files/use-file-tree.ts";
import {JErrorText} from "@ben-ryder/jigsaw-react";
import "./file-system-explorer.css"

function FileSystemItem(props: OPFSXFile | OPFSXDirectoryTree) {
	// todo: move to prop
	const { openTab } = useWorkspaceContext()

	if (props.kind === "file") {
		return (
			<button
				className="file-explorer__file"
				onClick={() => {
					openTab({type: "file", filePath: props.path}, {switch: true})
				}}
			>
				<p>{props.name}</p>
			</button>
		)
	}

	return (
		<div className="file-explorer__folder">
			<div className="file-explorer__folder-name" data-path={props.path}>
				<p>{props.name}</p>
			</div>
			<div className="file-explorer__folder-children" style={{paddingLeft: "20px"}}>
				{props.children.map(item => (
					<FileSystemItem key={item.path} {...item} />
				))}
			</div>
		</div>
	)
}

export function FileSystemExplorer() {
	const {currentDatabaseId, headbase} = useHeadbase()
	const fileTree = useFileTree(currentDatabaseId)

	if (fileTree.status === "loading") {
		return (
			<div>
				<p>Loading ...</p>
			</div>
		)
	}
	if (fileTree.status === "error") {
		return (
			<div>
				<JErrorText>An error occurred loading the file tree.</JErrorText>
			</div>
		)
	}

	if (fileTree?.result.children?.length === 0) {
		return (
			<div>
				<p>No Files Found</p>
			</div>
		)
	}

	return (
		<div>
			{fileTree?.result.children.map((item) => (
				<FileSystemItem key={item.path} {...item} />
			))}
		</div>
	)
}
