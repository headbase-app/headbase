import { render } from 'solid-js/web'
import {onMount} from "solid-js";

import type {
	FilePlugin,
	FilePluginEditorMethods,
	FilePluginEditorProps
} from "../../../../../02-apis/plugin/file-plugin";
import {PLUGIN_TYPES} from "../../../../../02-apis/plugin/plugin.api";

function View({apis, filePath}: FilePluginEditorProps) {
	onMount(async () => {
		const fileContents = await apis.filesAPI.readAsText(filePath)
		console.debug(fileContents)
	})

	return (
		<div>
			<h2>Headbase View</h2>
		</div>
	)
}


async function HeadbaseView(props: FilePluginEditorProps): Promise<FilePluginEditorMethods> {
	const root = document.createElement('div')
	props.container.append(root)

	const dispose = render(() => <View {...props} />, root)
	async function close() {
		dispose()
	}

	return {
		close
	}
}

export const HeadbaseViewPlugin: FilePlugin = {
	type: PLUGIN_TYPES.FILE,
	id: "headbase--views",
	name: "Headbase Views",
	description: "Provides support for Headbase .hb files which contain data views.",
	fileExtensions: [".hb"],
	editor: HeadbaseView,
}
