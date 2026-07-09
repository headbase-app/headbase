import {BasePlugin, BasePluginMetadata} from "./02-apis/plugin/plugins/base-plugin.ts";

// Text / Markdown
import {BasicMarkdownEditor} from "./04-ui/components/file-editor/editors/basic-markdown-editor.js";
// Media
import {ImageViewer} from "./04-ui/components/file-editor/editors/image-viewer.js";
import {AudioPlayer} from "./04-ui/components/file-editor/editors/audio-player.ts";
import {VideoPlayer} from "./04-ui/components/file-editor/editors/video-player.ts";
// Other files
import {PDFViewer} from "./04-ui/components/file-editor/editors/pdf-viewer.js";
// Headbase
import {ViewEditorPlugin} from "./04-ui/components/file-editor/editors/headbase-view/headbase-view.js";


export class HeadbaseCorePlugin extends BasePlugin {
	meta: BasePluginMetadata = {
		id: "headbase",
		name: "Headbase Core",
		description: "Provides the core built-in Headbase functionality.",
	}

	async load() {
		// Text / Markdown
		this.registerEditor(BasicMarkdownEditor)
		// Media
		this.registerEditor(ImageViewer)
		this.registerEditor(AudioPlayer)
		this.registerEditor(VideoPlayer)
		// Other files
		this.registerEditor(PDFViewer)
		// Headbase
		this.registerEditor(ViewEditorPlugin)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
