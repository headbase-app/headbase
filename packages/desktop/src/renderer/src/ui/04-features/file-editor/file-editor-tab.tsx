import {useEffect} from "react";
import {useFileEditor, FileEditorOptions} from "./form/use-file-editor";
import {FileEditor} from "./form/file-editor";
import {useWorkspace} from "@ui/04-features/workspace/framework/use-workspace";
import {WithTabData} from "@ui/04-features/workspace/workspace";

export interface ContentTabProps extends WithTabData, FileEditorOptions {}


export function FileEditorTab(props: ContentTabProps) {
	const { replaceTab, setTabName, setTabIsUnsaved, closeTab } = useWorkspace()
	const {folderPath, setFolderPath, filename, setFilename, content, setContent, fields, setFields, saveFile, deleteFile} = useFileEditor({filePath: props.filePath})

	async function onSave() {
		try {
			await saveFile()
			if (props.filePath) {
				setTabIsUnsaved(props.tabIndex, false)
			}
			else {
				replaceTab(props.tabIndex, {type: 'file', filePath: `${folderPath}/${filename}.md`})
			}
		}
		catch (e) {
			console.error(e)
		}
	}

	async function onDelete() {
		try {
			await deleteFile()
			closeTab(props.tabIndex)
		}
		catch (e) {
			console.error(e)
		}
	}

	// ensure tab name is up to date with entered name
	useEffect(() => {
		setTabName(props.tabIndex, filename || "untitled")
	}, [filename]);

	function onFolderPathChange(value: string) {
		setTabIsUnsaved(props.tabIndex, true)
		setFolderPath(value)
	}

	function onFilenameChange(value: string) {
		setTabIsUnsaved(props.tabIndex, true)
		setFilename(value)
	}

	function onContentChange(value: string) {
		setTabIsUnsaved(props.tabIndex, true)
		setContent(value)
	}

	function onFieldsChange(value: string) {
		setTabIsUnsaved(props.tabIndex, true)
		setFields(value)
	}

	return (
		<div>
			<FileEditor
				folderPath={folderPath}
				onFolderPathChange={onFolderPathChange}
				filename={filename}
				onFilenameChange={onFilenameChange}
				content={content}
				onContentChange={onContentChange}
				fields={fields}
				onFieldsChange={onFieldsChange}
				tabIndex={props.tabIndex}
				onSave={onSave}
				onDelete={props.filePath ? onDelete : undefined}
			/>
		</div>
	)
}
