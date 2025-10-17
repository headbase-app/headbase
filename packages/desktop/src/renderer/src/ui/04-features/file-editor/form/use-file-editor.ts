import {useEffect, useState} from "react";
import {useDependency} from "@framework/dependency.context";
export interface FileEditorOptions {
	filePath?: string
}

export interface FileEditorChangeHandlers {
	onFolderPathChange: (name: string) => void;
	onFilenameChange: (name: string) => void;
	onContentChange: (content: string) => void;
	onFieldsChange: (fields: string) => void;
}


export function useFileEditor(options: FileEditorOptions) {
	const { filesApi } = useDependency()

	const [folderPath, setFolderPath] = useState('')
	const [filename, setFilename] = useState('')
	const [content, setContent] = useState('')
	const [fields, setFields] = useState('')

	// Load file
	useEffect(() => {
		async function load() {
			if (!options.filePath) return

			const file = await filesApi.read(options.filePath)

			const decoder = new TextDecoder()
			const text = decoder.decode(file.buffer)
			setContent(text)
			setFolderPath(file.folderPath)
			setFilename(file.fileName)

			// const fieldsString = Object.entries(file.fields)
			// 		.map(([k, v]) => `${k}: ${v}`)
			// 		.join("\n")
			// setFields(fieldsString)
		}
		load()
	}, [filesApi, options.filePath])

	async function saveFile() {
		// const fieldsData = fields
		// 	.split("\n")
		// 	.filter(Boolean)
		// 	.map(line => {
		// 		return line.split(":").filter(Boolean)
		// 	})

		const encoder = new TextEncoder()
		const encodedContent = encoder.encode(content)
		await filesApi.write({
			folderPath,
			filename,
			buffer: encodedContent.buffer
		})
	}

	async function deleteFile() {
		if (!options.filePath) {
			throw new Error("Attempted to delete when file doesn't exist yet.")
		}

		await filesApi.rm(options.filePath)
	}

	return {
		saveFile, deleteFile,
		folderPath, setFolderPath,
		filename, setFilename,
		content, setContent,
		fields, setFields
	}
}
