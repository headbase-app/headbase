import {BasePlugin, BasePluginMetadata} from "../../../02-apis/plugin/base-plugin.ts";
import {FileEditorWorkspaceItem} from "./file-editor.workspace.ts";

import {BasicMarkdownEditor} from "./editors/basic-markdown-editor.ts";
import {ImageViewer} from "./editors/image-viewer.ts";
import {AudioPlayer} from "./editors/audio-player.ts";
import {VideoPlayer} from "./editors/video-player.ts";
import {ViewEditor} from "./editors/view/view-editor.ts";
import {PDFViewer} from "./editors/pdf-viewer.ts";

export const FILE_EDITOR_PLUGIN_ID = "https://spec.headbase.app/v1/plugins/file"

export class FileEditorPlugin extends BasePlugin {
	meta: BasePluginMetadata = {
		id: FILE_EDITOR_PLUGIN_ID,
		name: "File Editor",
		description: "A core plugin providing file editing functionality.",
	}

	async load() {
		this.registerWorkspaceItem(FileEditorWorkspaceItem)

		this.registerEditor(BasicMarkdownEditor)
		this.registerEditor(ImageViewer)
		this.registerEditor(AudioPlayer)
		this.registerEditor(VideoPlayer)
		this.registerEditor(PDFViewer)
		this.registerEditor(ViewEditor)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
