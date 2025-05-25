import {useHeadbase} from "../../../logic/react/use-headbase.tsx";
import * as opfsx from "opfsx"
import {useEffect, useState} from "react";
import {OPFSXDirectoryTree, OPFSXFile} from "opfsx";
import {useWorkspaceContext} from "../workspace/workspace-context.tsx";

// @ts-expect-error -- adding for easy debugging and testing during development
window.opfsx = opfsx

function FileSystemItem(props: OPFSXFile | OPFSXDirectoryTree) {
	// todo: move to prop
	const { openTab } = useWorkspaceContext()

	if (props.kind === "file") {
		return (
			<button
				className="flex gap-3 items-center"
				onClick={() => {
					openTab({type: "file", path: props.path}, {switch: true})
				}}
			>
				<p>{props.name}</p>
			</button>
		)
	}

	return (
		<div>
			<div className="flex gap-3 items-center" data-path={props.path}>
				<p className="font-bold">{props.name}</p>
			</div>
			<div style={{paddingLeft: "20px"}}>
				{props.children.map(item => (
					<FileSystemItem key={item.path} {...item} />
				))}
			</div>
		</div>
	)
}

export function FileSystemExplorer() {
	const {currentDatabaseId} = useHeadbase()
	const [fileSystem, setFileSystem] = useState<OPFSXDirectoryTree | null>(null)

	useEffect(() => {
		async function load() {
			// ensure directory for current vault exists
			await opfsx.mkdir(`/headbase-v1/${currentDatabaseId}`)
			const fs = await opfsx.tree(`/headbase-v1/${currentDatabaseId}`)
			setFileSystem(fs)
		}

		if (currentDatabaseId) {
			load()
		}
	}, [currentDatabaseId]);

	return (
		<div>
			{fileSystem?.children.map((item) => (
				<FileSystemItem key={item.path} {...item} />
			))}
			{fileSystem?.children.length === 0 && (
				<p>No files or folders found</p>
			)}
		</div>
	)
}
