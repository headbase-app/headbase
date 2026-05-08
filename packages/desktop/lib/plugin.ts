import type {Plugin} from "./02-apis/plugin/plugin.api.js";

// Text / Markdown
import {BasicMarkdownEditorPlugin} from "./04-ui/components/file-editor/editors/files/basic-markdown-editor.js";
// Media
import {ImageViewerPlugin} from "./04-ui/components/file-editor/editors/files/image-viewer.js";
import {AudioPlayerPlugin} from "./04-ui/components/file-editor/editors/files/audio-player.ts";
import {VideoPlayerPlugin} from "./04-ui/components/file-editor/editors/files/video-player.ts";
// Other files
import {PDFViewerPlugin} from "./04-ui/components/file-editor/editors/files/pdf-viewer.js";
// Headbase
import {HeadbaseViewPlugin} from "./04-ui/components/file-editor/editors/headbase/view-editor.js";

export const HeadbaseCorePlugin: Plugin = {
	id: "headbase",
	name: "Headbase",
	description: "The core Headbase plugin providing all built-in functionality.",
	plugins: [
		// Text / Markdown
		BasicMarkdownEditorPlugin,
		// Media
		ImageViewerPlugin,
		AudioPlayerPlugin,
		VideoPlayerPlugin,
		// Other files
		PDFViewerPlugin,
		// Headbase
		HeadbaseViewPlugin
	]
}
