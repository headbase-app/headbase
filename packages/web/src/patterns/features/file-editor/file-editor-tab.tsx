import {FileEditor} from "./form/file-editor.tsx";

import { WithTabData } from "../workspace/workspace.tsx";
import {useWorkspaceContext} from "../workspace/workspace-context.tsx";
import {useCallback, useEffect} from "react";
import {useFileEditor, FileEditorOptions} from "./form/useFileEditor.ts";
import {useHeadbase} from "../../../logic/react/use-headbase.tsx";

import * as opfsx from "opfsx"

export interface ContentTabProps extends WithTabData, FileEditorOptions {}


export function FileEditorTab(props: ContentTabProps) {
	const {headbase, currentDatabaseId} = useHeadbase()
	const { replaceTab, setTabName, setTabIsUnsaved, closeTab } = useWorkspaceContext()

	const {path, setPath, name, setName, content, setContent, fields, setFields} = useFileEditor({path: props.path})

	const onSave = useCallback(async () => {
		// todo: does this need feedback of some kind?
		if (!currentDatabaseId) return

		try {
			const newFilePath = `/headbase-v1/${currentDatabaseId}${path}${name}.md`
			const frontMatter = fields ? `---\n${fields}\n---`: ''
			const contentToSave = `${frontMatter}${frontMatter && '\n\n'}${content}`
			//await opfsx.write(newFilePath, contentToSave)
			console.debug(`write to: ${newFilePath}`)
			console.debug(contentToSave)

			if (props.path) {
				// if the file has moved, remove the original file.
				if (props.path && props.path !== newFilePath) {
					console.debug(`remove old path: ${props.path}`)
					await opfsx.rm(props.path)
				}

				setTabIsUnsaved(props.tabIndex, false)
			}
			else {
				replaceTab(props.tabIndex, {type: 'file', path: newFilePath})
			}
		}
		catch (e) {
			console.error(e)
		}
	}, [headbase, replaceTab, setTabIsUnsaved])

	// ensure tab name is up to date with entered name
	useEffect(() => {
		setTabName(props.tabIndex, name || "untitled")
	}, [name, props.tabIndex, setTabName]);

	const onDelete = useCallback(async () => {
		// todo: does this need feedback of some kind?
		if (!currentDatabaseId || !headbase) return

		// this should never really happen, but protect against it just in case.
		if (!props.path) {
			console.error("Attempted to delete when file doesn't exist yet")
			return
		}

		try {
			await opfsx.rm(props.path)
			closeTab(props.tabIndex)
		}
		catch (e) {
			console.error(e)
		}
	}, [props.path, headbase, currentDatabaseId])

	const onPathChange = useCallback((path: string) => {
		setTabIsUnsaved(props.tabIndex, true)
		setPath(path)
	}, [props.tabIndex])

	const onNameChange = useCallback((name: string) => {
		setTabIsUnsaved(props.tabIndex, true)
		setName(name)
	}, [props.tabIndex])

	const onContentChange = useCallback((content: string) => {
		setTabIsUnsaved(props.tabIndex, true)
		setContent(content)
	}, [props.tabIndex])

	const onFieldsChange = useCallback((fields: string) => {
		setTabIsUnsaved(props.tabIndex, true)
		setFields(fields)
	}, [props.tabIndex])

	return (
		<div>
			<FileEditor
				path={path}
				onPathChange={onPathChange}
				name={name}
				onNameChange={onNameChange}
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