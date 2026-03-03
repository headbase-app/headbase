import {type FilePlugin, type FilePluginProps, type FilePluginReturn, PLUGIN_TYPES} from "@headbase-app/libweb";


async function HeadbaseView({document, apis, filePath, container}: FilePluginProps): Promise<FilePluginReturn> {
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
	supportedExtensions: [".hb"],
	run: HeadbaseView,
}
