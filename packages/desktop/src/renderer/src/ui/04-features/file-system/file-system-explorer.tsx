import {ErrorText} from "@ui/01-atoms/error-text/error-text";
import {FileSystemDirectory, FileSystemFile} from "@/main/file-system/operations";
import {useFilesTree} from "@framework/hooks/use-files-tree";

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
	const fileTreeQuery = useFilesTree()

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
		<div className="flex flex-col justify-start px-4 overflow-scroll">
			{fileTreeQuery.result.children.map((item) => (
				<FileSystemItem key={item.path} {...item} />
			))}
		</div>
	)
}
