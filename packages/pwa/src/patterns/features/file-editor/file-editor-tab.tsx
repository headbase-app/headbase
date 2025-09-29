import {FileEditor} from "./form/file-editor.tsx";

import { WithTabData } from "../workspace/workspace.tsx";
import {useWorkspaceContext} from "../workspace/workspace-context.tsx";
import {useEffect} from "react";
import {useFileEditor, FileEditorOptions} from "./form/useFileEditor.ts";
import {useHeadbase} from "../../../headbase/hooks/use-headbase.tsx";

export interface ContentTabProps extends WithTabData, FileEditorOptions {}


export function FileEditorTab(props: ContentTabProps) {
	const {currentDatabaseId} = useHeadbase()
	const { replaceTab, setTabName, setTabIsUnsaved, closeTab } = useWorkspaceContext()

	const {folderPath, setFolderPath, filename, setFilename, content, setContent, fields, setFields, saveFile, deleteFile} = useFileEditor({filePath: props.filePath})

	async function onSave() {
		// todo: does this need feedback of some kind?
		if (!currentDatabaseId) return

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