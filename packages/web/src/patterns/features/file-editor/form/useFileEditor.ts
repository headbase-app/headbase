import {useEffect, useState} from "react";
import {useHeadbase} from "../../../../headbase/hooks/use-headbase.tsx";

export interface FileEditorOptions {
	path?: string
}

export interface FileEditorData {
	path: string,
	displayName: string,
	content: string
	fields: string
}

export interface FileEditorChangeHandlers {
	onPathChange: (name: string) => void;
	onDisplayNameChange: (data: string) => void;
	onContentChange: (data: string) => void;
	onFieldsChange: (data: string) => void;
}


export function useFileEditor(options: FileEditorOptions) {
	const {currentDatabaseId, headbase} = useHeadbase()

	const [existingPath, setExistingPath] = useState<string|null>(options?.path || null)
	const [path, setPath] = useState<string>(options?.path || '')
	const [displayName, setDisplayName] = useState<string>('')
	const [content, setContent] = useState<string>('')
	const [fields, setFields] = useState<string>('')

	// Load file
	useEffect(() => {
		async function load() {
			if (!currentDatabaseId || !options.path) return

			const file = await headbase.fileSystem.loadMarkdownFile(currentDatabaseId, options.path)
			setPath(file.path)
			setExistingPath(file.existingPath)
			setDisplayName(file.displayName)
			setContent(file.content)

			const fieldsString = Object.entries(file.fields)
					.map(([k, v]) => `${k}: ${v}`)
					.join("\n")
			setFields(fieldsString)
		}
		load()
	}, [headbase, options.path, currentDatabaseId])

	async function saveFile() {
		if (!currentDatabaseId) throw new Error('No current database')

		const fieldsData = fields
			.split("\n")
			.filter(Boolean)
			.map(line => {
				return line.split(":").filter(Boolean)
			})
		console.debug(fieldsData)

		await headbase.fileSystem.saveMarkdownFile(currentDatabaseId, {
			path,
			displayName,
			content,
			fields: {}
		}, existingPath)
	}

	async function deleteFile() {
		if (!currentDatabaseId) {
			throw new Error("Attempted to save file with no database open")
		}
		if (!options.path) {
			throw new Error("Attempted to delete when file doesn't exist yet.")
		}

		await headbase.fileSystem.delete(currentDatabaseId, options.path)
	}

	return {
		saveFile, deleteFile,
		path, setPath,
		displayName, setDisplayName,
		content, setContent,
		fields, setFields
	}
}
