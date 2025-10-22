import {ErrorText} from "@ui/01-atoms/error-text/error-text";
import {FileSystemDirectory, FileSystemFile} from "@/main/apis/files/operations";
import {useFilesTree} from "@framework/hooks/use-files-tree";
import {ReactNode} from "react";
import {useWorkspace} from "@ui/04-features/workspace/framework/use-workspace";

export interface FileItemProps {
	path: string
	filename: string
	tooltip: string | ReactNode
	onOpen: (path: string) => void
}

function FileItem({path, filename, tooltip, onOpen}: FileItemProps) {
	return (
		// <Tooltip
		// 	content={tooltip}
		// 	preferredPosition='right'
		// 	renderAsChild
		// >
			<button
				className="text-sm w-full overflow-clip whitespace-nowrap text-left py-2 px-4 hover:bg-navy-50 hover:cursor-pointer rounded-md text-navy-white-50"
				onClick={() => {onOpen(path)}}
			>{filename}</button>
		// </Tooltip>
	)
}

export type FileSystemItemProps = {
	onOpen: (path: string) => void;
} & (FileSystemFile | FileSystemDirectory)

function FileSystemItem(props: FileSystemItemProps) {
	if (props.type === "file") {
		return (
			<FileItem
				path={props.path}
				filename={props.name}
				onOpen={props.onOpen}
				tooltip={<>
					<p>{props.name}</p>
				</>}
			/>
		)
	}

	return (
		<div>
			<FileItem
				path={props.path}
				filename={props.name}
				onOpen={props.onOpen}
				tooltip={
					<>
						<p>{props.name}</p>
					</>
				}
			/>
			<div className="flex flex-col justify-start" style={{paddingLeft: "20px"}}>
				{props.children.map(item => (
					<FileSystemItem
						key={item.path}
						{...item}
						onOpen={props.onOpen}
					/>
				))}
			</div>
		</div>
	)
}

export function FileSystemExplorer() {
	const fileTreeQuery = useFilesTree()
	const { openTab } = useWorkspace()

	if (fileTreeQuery.status === "loading") {
		return (
			<div>
				<p>Loading ...</p>
			</div>
		)
	}
	if (fileTreeQuery.status === "error") {
		// todo: imporve typing of errors?
		if (fileTreeQuery.errors[0]?.identifier === 'no-open-vault') return
		return (
			<div>
				<ErrorText>An error occurred loading the file tree.</ErrorText>
			</div>
		)
	}

	if (!fileTreeQuery.result) {
		return;
	}

	if (fileTreeQuery.result.children.length === 0) {
		return (
			<div>
				<p>No Files Found</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col justify-start px-4">
			{fileTreeQuery.result.children.map((item) => (
				<FileSystemItem key={item.path} {...item} onOpen={(filePath) => {
					openTab({type: "file", filePath})
				}}/>
			))}
		</div>
	)
}
