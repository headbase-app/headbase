import {useEffect, useState} from "react";
import {useHeadbase} from "../../../../logic/react/use-headbase.tsx";
import * as opfsx from "opfsx"
import {parseMarkdownFrontMatter} from "../../../../utils/frontmatter.ts";

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
			const parsed = await parseMarkdownFrontMatter(content)
			const frontMatterString = parsed.data
				? Object.entries(parsed.data)
					.map(([k, v]) => `${k}: ${v}`)
					.join("\n")
				: ''

			const parsedPath = opfsx.parsePath(options.path)
			const relativePath = parsedPath.parentPath.replace(`/headbase-v1/${currentDatabaseId}`, "") || "/"

			setPath(relativePath)
			setName(file.name.replace(".md", ""))
			setContent(parsed.content)
			setFields(frontMatterString)
		}
		load()
	}, [options.path, currentDatabaseId])

	return {
		path, setPath,
		name, setName,
		content, setContent,
		fields, setFields
	}
}
