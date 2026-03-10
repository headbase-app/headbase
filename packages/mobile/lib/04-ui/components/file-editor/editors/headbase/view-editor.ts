import type {
	FilePlugin,
	FilePluginEditorMethods,
	FilePluginEditorProps
} from "../../../../../02-apis/plugin/file-plugin";
import {PLUGIN_TYPES} from "../../../../../02-apis/plugin/plugin.api";


async function HeadbaseView({document, apis, filePath, container}: FilePluginEditorProps): Promise<FilePluginEditorMethods> {
	const fileContents = await apis.filesAPI.readAsText(filePath)
	const message = document.createElement("p")
	message.innerText = "Headbase View"
	container.append(message)

	async function close() {
		container.removeChild(message)
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
