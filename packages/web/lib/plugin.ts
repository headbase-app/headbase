import type {Plugin} from "./02-apis/plugin/plugin.api.js";

// import {BasicMarkdownEditorPlugin} from "./04-ui/components/file-editor/editors/files/basic-markdown-editor.js";
// import {ImageViewerPlugin} from "./04-ui/components/file-editor/editors/files/image-viewer.js";
// import {PDFViewerPlugin} from "./04-ui/components/file-editor/editors/files/pdf-viewer.js";
// import {HeadbaseViewPlugin} from "./04-ui/components/file-editor/editors/headbase/view-editor.js";

export const HeadbaseCorePlugin: Plugin = {
	id: "headbase",
	name: "Headbase",
	description: "",
	plugins: [
		// BasicMarkdownEditorPlugin,
		// ImageViewerPlugin,
		// PDFViewerPlugin,
		// HeadbaseViewPlugin
	]
}
