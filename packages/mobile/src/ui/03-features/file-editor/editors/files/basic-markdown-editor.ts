import {
	type FilePlugin,
	type FilePluginProps,
	type FilePluginReturn,
	PLUGIN_TYPES
} from "@headbase-app/libweb";


async function BasicMarkdownEditor({document, apis, filePath, container}: FilePluginProps): Promise<FilePluginReturn> {
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
	id: "headbase--basic-markdown-editor",
	name: "Basic Markdown Editor",
	description: "Provides a basic markdown editor without additional EHadbase",
	supportedExtensions: [".md"],
	run: BasicMarkdownEditor,
}
