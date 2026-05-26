import {
	BasePlugin,
	BasePluginMetadata,
} from "./02-apis/plugin/plugin.api.js";

// Text / Markdown
import {BasicMarkdownEditor} from "./04-ui/components/file-editor/editors/files/basic-markdown-editor.js";
// Media
import {ImageViewer} from "./04-ui/components/file-editor/editors/files/image-viewer.js";
import {AudioPlayer} from "./04-ui/components/file-editor/editors/files/audio-player.ts";
import {VideoPlayer} from "./04-ui/components/file-editor/editors/files/video-player.ts";
// Other files
import {PDFViewer} from "./04-ui/components/file-editor/editors/files/pdf-viewer.js";
// Headbase
import {ViewEditor} from "./04-ui/components/file-editor/editors/headbase/view-editor.js";


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
		this.registerEditor(ViewEditor)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
