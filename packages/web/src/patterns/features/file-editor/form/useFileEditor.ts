import {useEffect, useState} from "react";
import {useHeadbase} from "../../../../headbase/hooks/use-headbase.tsx";
import {MarkdownFile} from "../../../../headbase/services/file-system/file-system.service.ts";

export interface FileEditorOptions {
	filePath?: string
}

export interface FileEditorData {
	file: MarkdownFile
}

export interface FileEditorChangeHandlers {
	onFolderPathChange: (name: string) => void;
	onFilenameChange: (name: string) => void;
	onContentChange: (content: string) => void;
	onFieldsChange: (fields: string) => void;
}


export function useFileEditor(options: FileEditorOptions) {
	const {currentDatabaseId, headbase} = useHeadbase()

	const [file, setFile] = useState<MarkdownFile | null>(null)
	const [folderPath, setFolderPath] = useState('')
	const [filename, setFilename] = useState('')
	const [content, setContent] = useState('')
	const [fields, setFields] = useState('')

	// Load file
	useEffect(() => {
		async function load() {
			if (!currentDatabaseId || !options.filePath) return

			const file = await headbase.fileSystem.loadMarkdownFile(currentDatabaseId, options.filePath)
			setFile(file)

			setFolderPath(file.folderPath)
			setFilename(file.filename)
			setContent(file.content)

			const fieldsString = Object.entries(file.fields)
					.map(([k, v]) => `${k}: ${v}`)
					.join("\n")
			setFields(fieldsString)
		}
		load()
	}, [headbase, options.filePath, currentDatabaseId])

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
			folderPath,
			filename,
			content,
			fields: {}
		}, file)
	}

	async function deleteFile() {
		if (!currentDatabaseId) {
			throw new Error("Attempted to save file with no database open")
		}
		if (!options.filePath) {
			throw new Error("Attempted to delete when file doesn't exist yet.")
		}

		await headbase.fileSystem.delete(currentDatabaseId, options.filePath)
	}

	return {
		saveFile, deleteFile,
		folderPath, setFolderPath,
		filename, setFilename,
		content, setContent,
		fields, setFields
	}
}
