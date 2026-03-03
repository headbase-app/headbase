import { type Plugin } from "@headbase-app/libweb"

import {BasicMarkdownEditorPlugin} from "@ui/03-features/file-editor/editors/files/basic-markdown-editor.ts";
import {ImageViewerPlugin} from "@ui/03-features/file-editor/editors/files/image-viewer.ts";
import {PDFViewerPlugin} from "@ui/03-features/file-editor/editors/files/pdf-viewer.ts";
import {HeadbaseViewPlugin} from "@ui/03-features/file-editor/editors/headbase/view-editor.ts";

export const HeadbaseCorePlugin: Plugin = {
	id: "headbase",
	name: "Headbase",
	description: "",
	plugins: [
		BasicMarkdownEditorPlugin,
		ImageViewerPlugin,
		PDFViewerPlugin,
		HeadbaseViewPlugin
	]
}
