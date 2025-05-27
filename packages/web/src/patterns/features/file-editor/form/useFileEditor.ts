import {useEffect, useState} from "react";
import * as opfsx from "opfsx"
import {parseMarkdownFrontMatter} from "../../../../utils/frontmatter.ts";
import {useHeadbase} from "../../../../headbase/hooks/use-headbase.tsx";

export interface FileEditorOptions {
	path?: string
}

export interface FileEditorData {
	path: string,
	name: string,
	content: string
	fields: string
}

export interface FileEditorChangeHandlers {
	onPathChange: (name: string) => void;
	onNameChange: (data: string) => void;
	onContentChange: (data: string) => void;
	onFieldsChange: (data: string) => void;
}


export function useFileEditor(options: FileEditorOptions) {
	const {currentDatabaseId} = useHeadbase()

	const [path, setPath] = useState<string>(options?.path || '')
	const [name, setName] = useState<string>('')
	const [content, setContent] = useState<string>('')
	const [fields, setFields] = useState<string>('')

	// Load file
	useEffect(() => {
		async function load() {
			if (!currentDatabaseId || !options.path) return

			const file = await opfsx.read(options.path)
			const content = await file.text()
			const parsed = parseMarkdownFrontMatter(content)

			const {$name: frontMatterName, ...frontMatter } = parsed.data
			const frontMatterString = frontMatter
				? Object.entries(frontMatter)
					.map(([k, v]) => `${k}: ${v}`)
					.join("\n")
				: ''

			const displayName = typeof frontMatterName === 'string' ? frontMatterName : file.name.replace(".md", "")

			// get the path relative to the vault folder, the full path is an implementation detail the user shouldn't know about.
			const relativePath = options.path.replace(`/headbase-v1/${currentDatabaseId}`, "") || "/"

			// A newline is automatically added between the frontmatter and content when saving, so ensure this is removed
			const trimmedContent = parsed.content.trim()

			setPath(relativePath)
			setName(displayName)
			setContent(trimmedContent)
			setFields(frontMatterString)
		}
		load()
	}, [options.path, currentDatabaseId])

	async function saveFile(): Promise<string> {
		if (!currentDatabaseId) {
			throw new Error("Attempted to save file with no database open")
		}

		const newFilePath = `/headbase-v1/${currentDatabaseId}${path}`

		const frontMatter = fields ? `---\n$name: ${name}\n${fields.trim()}\n---`: ''
		const contentToSave = `${frontMatter}${frontMatter && '\n\n'}${content}`
		await opfsx.write(newFilePath, contentToSave)
		console.debug(`write to: ${newFilePath}`)
		console.debug(contentToSave)

		if (options.path && options.path !== newFilePath) {
			console.debug(`remove old path: ${options.path}`)
			await opfsx.rm(options.path)
		}

		return newFilePath
	}

	async function deleteFile() {
		if (!currentDatabaseId) {
			throw new Error("Attempted to save file with no database open")
		}

		if (!options.path) {
			throw new Error("Attempted to delete when file doesn't exist yet.")
		}

		await opfsx.rm(options.path)
	}

	return {
		saveFile, deleteFile,
		path, setPath,
		name, setName,
		content, setContent,
		fields, setFields
	}
}
