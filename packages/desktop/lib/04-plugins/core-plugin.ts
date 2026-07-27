import {BasePlugin, BasePluginMetadata} from "../02-apis/plugin/base-plugin.ts";

// Text / Markdown
import {BasicMarkdownEditor} from "./editors/basic-markdown-editor.js";
import {ImageViewer} from "./editors/image-viewer.js";
import {AudioPlayer} from "./editors/audio-player.ts";
import {VideoPlayer} from "./editors/video-player.ts";
import {PDFViewer} from "./editors/pdf-viewer.js";
import {ViewEditor} from "./editors/view/view-editor.js";

import {MarkdownSourcePlugin} from "./view-sources/markdown-source.ts";
import {CardsView} from "./view-displays/cards-view.ts";

import {ContentTypesPlugin} from "./features/content-types/content-types.plugin.ts";
import {FileExplorerPlugin} from "./features/file-explorer/file-explorer.plugin.ts";
import {NewFilePlugin} from "./features/new-file/new-file.plugin.ts";
import {SearchPlugin} from "./features/search/search.plugin.ts";


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

		this.registerViewSource(MarkdownSourcePlugin)

		this.registerViewDisplay(CardsView)

		this.registerPlugin(ContentTypesPlugin)
		this.registerPlugin(FileExplorerPlugin)
		this.registerPlugin(NewFilePlugin)
		this.registerPlugin(SearchPlugin)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
