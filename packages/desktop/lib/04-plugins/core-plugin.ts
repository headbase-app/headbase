import {BasePlugin, BasePluginMetadata} from "../02-apis/plugin/base-plugin.ts";

import {MarkdownSourcePlugin} from "./view-sources/markdown-source.ts";
import {CardsView} from "./view-displays/cards-view.ts";

import {ContentTypesPlugin} from "./features/content-types/content-types.plugin.ts";
import {FileExplorerPlugin} from "./features/file-explorer/file-explorer.plugin.ts";
import {NewFilePlugin} from "./features/new-file/new-file.plugin.ts";
import {SearchPlugin} from "./features/search/search.plugin.ts";
import {FileEditorPlugin} from "./features/file-editor/file-editor.plugin.ts";

export class HeadbaseCorePlugin extends BasePlugin {
	meta: BasePluginMetadata = {
		id: "headbase",
		name: "Headbase Core",
		description: "Provides the core built-in Headbase functionality.",
	}

	async load() {
		this.registerPlugin(FileEditorPlugin)

		this.registerPlugin(ContentTypesPlugin)
		this.registerPlugin(FileExplorerPlugin)
		this.registerPlugin(NewFilePlugin)
		this.registerPlugin(SearchPlugin)

		this.registerViewSource(MarkdownSourcePlugin)
		this.registerViewDisplay(CardsView)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
