import {BasePlugin, type PluginMetadata} from "../02-apis/plugin/base-plugin.ts";

import {TypesPlugin} from "./types/types.plugin.ts";
import {NewFilePlugin} from "./new-file/new-file.plugin.ts";
import {SearchPlugin} from "./search/search.plugin.ts";

import {JSONEditor} from "./editors/json-editor.ts";
import {AudioPlayer} from "./editors/audio-player.ts";
import {ImageViewer} from "./editors/image-viewer.ts";
import {VideoPlayer} from "./editors/video-player.ts";
import {PDFViewer} from "./editors/pdf-viewer.ts";

export class HeadbaseCorePlugin extends BasePlugin {
	meta: PluginMetadata = {
		id: "headbase",
		name: "Headbase Core",
		description: "Provides the core built-in Headbase functionality.",
	}

	async load() {
		this.registerPlugin(TypesPlugin)
		this.registerPlugin(NewFilePlugin)
		this.registerPlugin(SearchPlugin)

		this.registerEditor(JSONEditor)
		this.registerEditor(AudioPlayer)
		this.registerEditor(ImageViewer)
		this.registerEditor(VideoPlayer)
		this.registerEditor(PDFViewer)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
