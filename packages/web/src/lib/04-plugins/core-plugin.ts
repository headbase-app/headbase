import {BasePlugin} from "../02-apis/plugin/base-plugin.ts";
import type {PluginMetadata} from "../02-apis/plugin/base-plugin.ts";

import {MarkdownSourcePlugin} from "./view-sources/markdown-source.ts";
import {CardsView} from "./view-displays/cards-view.ts";

import {ContentTypesPlugin} from "./features/content-types/content-types.plugin.ts";
import {NewFilePlugin} from "./features/new-file/new-file.plugin.ts";
import {SearchPlugin} from "./features/search/search.plugin.ts";

export class HeadbaseCorePlugin extends BasePlugin {
	meta: PluginMetadata = {
		id: "headbase",
		name: "Headbase Core",
		description: "Provides the core built-in Headbase functionality.",
	}

	async load() {
		this.registerPlugin(ContentTypesPlugin)
		this.registerPlugin(NewFilePlugin)
		this.registerPlugin(SearchPlugin)

		this.registerViewSource(MarkdownSourcePlugin)
		this.registerViewDisplay(CardsView)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
