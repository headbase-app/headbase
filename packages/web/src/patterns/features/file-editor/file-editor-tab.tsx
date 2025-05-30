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

	const {path, setPath, displayName, setDisplayName, content, setContent, fields, setFields, saveFile, deleteFile} = useFileEditor({path: props.path})

	async function onSave() {
		// todo: does this need feedback of some kind?
		if (!currentDatabaseId) return

		try {
			await saveFile()
			if (props.path) {
				setTabIsUnsaved(props.tabIndex, false)
			}
			else {
				replaceTab(props.tabIndex, {type: 'file', path: path})
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
		setTabName(props.tabIndex, displayName || "untitled")
	}, [displayName]);

	function onPathChange(value: string) {
		setTabIsUnsaved(props.tabIndex, true)
		setPath(value)
	}

	function onDisplayNameChange(value: string) {
		setTabIsUnsaved(props.tabIndex, true)
		setDisplayName(value)
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
				path={path}
				onPathChange={onPathChange}
				displayName={displayName}
				onDisplayNameChange={onDisplayNameChange}
				content={content}
				onContentChange={onContentChange}
				fields={fields}
				onFieldsChange={onFieldsChange}
				tabIndex={props.tabIndex}
				onSave={onSave}
				onDelete={props.path ? onDelete : undefined}
			/>
		</div>
	)
}