import {BasePlugin, BasePluginMetadata} from "./02-apis/plugin/plugins/base-plugin.ts";

// Text / Markdown
import {BasicMarkdownEditor} from "./04-plugins/editors/basic-markdown-editor.js";
import {ImageViewer} from "./04-plugins/editors/image-viewer.js";
import {AudioPlayer} from "./04-plugins/editors/audio-player.ts";
import {VideoPlayer} from "./04-plugins/editors/video-player.ts";
import {PDFViewer} from "./04-plugins/editors/pdf-viewer.js";
import {ViewEditor} from "./04-plugins/editors/view/view-editor.js";

import {MarkdownSourcePlugin} from "./04-plugins/sources/markdown-source.ts";
import {CardsView} from "./04-plugins/views/cards-view.ts";


export class HeadbaseCorePlugin extends BasePlugin {
	meta: BasePluginMetadata = {
		id: "headbase",
		name: "Headbase Core",
		description: "Provides the core built-in Headbase functionality.",
	}

	async load() {
		this.registerEditor(BasicMarkdownEditor)
		this.registerEditor(ImageViewer)
		this.registerEditor(AudioPlayer)
		this.registerEditor(VideoPlayer)
		this.registerEditor(PDFViewer)
		this.registerEditor(ViewEditor)

		this.registerSource(MarkdownSourcePlugin)

		this.registerView(CardsView)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
