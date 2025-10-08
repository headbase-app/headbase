import {ErrorText} from "@ui/01-atoms/error-text/error-text";
import {FileSystemDirectory, FileSystemFile} from "@/main/file-system/operations";
import {useFilesTree} from "@framework/hooks/use-files-tree";
import { Tooltip } from "@ui/02-components/tooltip/tooltip";
import {ComponentProps, ReactNode} from "react";

export interface FileItemProps extends ComponentProps<'button'> {
	name: string
	tooltip: string | ReactNode
}

function FileItem({name, tooltip, ...htmlProps}: FileItemProps) {
	return (
		// <Tooltip
		// 	content={tooltip}
		// 	preferredPosition='right'
		// 	renderAsChild
		// >
			<button
				className="w-full overflow-clip whitespace-nowrap text-left py-2 px-4 hover:bg-navy-50 hover:cursor-pointer rounded-md text-navy-white-50"
				{...htmlProps}
			>{name}</button>
		// </Tooltip>
	)
}

function FileSystemItem(props: FileSystemDirectory | FileSystemFile) {
	if (props.type === "file") {
		return (
			<FileItem
				name={props.name}
				tooltip={
					<>
						<p>{props.name}</p>
					</>
				}
			/>
		)
	}

	return (
		<div>
			<FileItem
				name={props.name}
				tooltip={
					<>
						<p>{props.name}</p>
					</>
				}
			/>
			<div className="flex flex-col justify-start" style={{paddingLeft: "20px"}}>
				{props.children.map(item => (
					<FileSystemItem key={item.path} {...item} />
				))}
			</div>
		</div>
	)
}

export function FileSystemExplorer() {
	const fileTreeQuery = useFilesTree()
	console.debug(fileTreeQuery)

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
				<FileSystemItem key={item.path} {...item} />
			))}
		</div>
	)
}
