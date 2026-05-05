import type {
	FilePlugin,
	FilePluginEditorMethods,
	FilePluginEditorProps
} from "../../../../../02-apis/plugin/file-plugin";
import {PLUGIN_TYPES} from "../../../../../02-apis/plugin/plugin.api";


async function HeadbaseView({document, apis, filePath, container}: FilePluginEditorProps): Promise<FilePluginEditorMethods> {
	const fileContents = await apis.filesAPI.readAsText(filePath)
	const textarea = document.createElement("textarea")
	textarea.value = fileContents
	container.append(textarea)

	async function close() {
		container.removeChild(textarea)
	}

	return {
		close
	}
}

export const HeadbaseViewPlugin: FilePlugin = {
	type: PLUGIN_TYPES.FILE,
	id: "headbase--views",
	name: "Headbase Views",
	description: "Provides Headbase views functionality via file plugin for opening .hb files",
	fileExtensions: [".hb"],
	editor: HeadbaseView,
}
