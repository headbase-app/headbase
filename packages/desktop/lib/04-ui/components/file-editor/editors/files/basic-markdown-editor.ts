import type {
	FilePlugin,
	FilePluginEditorMethods,
	FilePluginEditorProps
} from "../../../../../02-apis/plugin/file-plugin";
import {PLUGIN_TYPES} from "../../../../../02-apis/plugin/plugin.api";


async function BasicMarkdownEditor({document, apis, filePath, container}: FilePluginEditorProps): Promise<FilePluginEditorMethods> {
	const fileContents = await apis.filesAPI.readAsText(filePath)
	const textarea = document.createElement("textarea")
	textarea.value = fileContents
	container.append(textarea)

	async function save() {
		await apis.filesAPI.writeText(filePath, textarea.value)
	}

	async function close() {
		container.removeChild(textarea)
	}

	return {
		save,
		close
	}
}

export const BasicMarkdownEditorPlugin: FilePlugin = {
	type: PLUGIN_TYPES.FILE,
	id: "headbase--basic-markdown",
	name: "Basic Markdown Editor",
	description: "Provides basic editing support for markdown files",
	fileIcon: "markdown",
	fileExtensions: [".md"],
	editor: BasicMarkdownEditor,
}
