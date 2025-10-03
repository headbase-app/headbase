import {FileSystemDirectory, FileSystemFile} from "../../../../main/file-system/operations";
import {ErrorText} from "@renderer/patterns/atoms/error-text/error-text";
import {useEffect, useState} from "react";
import {SUBSCRIPTION_LOADING_STATE, SubscriptionResult} from "@renderer/utils/subscriptions";

function FileSystemItem(props: FileSystemDirectory | FileSystemFile) {
	// todo: move to prop
	// const { openTab } = useWorkspaceContext()

	if (props.type === "file") {
		return (
			<button
				className="text-left py-2 px-4 hover:bg-navy-50 hover:cursor-pointer rounded-md"
				// onClick={() => {
				// 	openTab({type: "file", filePath: props.path}, {switch: true})
				// }}
			>{props.name}</button>
		)
	}

	return (
		<div>
			<div className="text-left py-2 px-4 hover:bg-navy-50 hover:cursor-pointer rounded-md" data-path={props.path}>
				<p>{props.name}</p>
			</div>
			<div className="flex flex-col justify-start" style={{paddingLeft: "20px"}}>
				{props.children.map(item => (
					<FileSystemItem key={item.path} {...item} />
				))}
			</div>
		</div>
	)
}

export function FileSystemExplorer() {
	const [fileTree, setFileTree] = useState<SubscriptionResult<FileSystemDirectory>>(SUBSCRIPTION_LOADING_STATE)

	useEffect(() => {
		async function load() {
			const result = await window.platformAPI.fileSystemTree()
			setFileTree(result)
		}
		load()
	}, []);

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
				<ErrorText>An error occurred loading the file tree.</ErrorText>
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
		<div className="flex flex-col justify-start px-4 overflow-scroll">
			{fileTree?.result.children.map((item) => (
				<FileSystemItem key={item.path} {...item} />
			))}
		</div>
	)
}
