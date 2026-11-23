import {BasePlugin, type PluginMetadata} from "@headbase-app/lib";
import {SearchShelfItem} from "./search.shelf.ts";
import {SearchWorkspaceItem} from "./search.workspace.ts";


export class SearchPlugin extends BasePlugin {
	meta: PluginMetadata = {
		id: "https://spec.headbase.app/v1/plugins/search",
		name: "Search",
		description: "A core plugin providing the ability to search documents.",
	}

	async load() {
		this.registerShelfItem(SearchShelfItem)
		this.registerWorkspaceItem(SearchWorkspaceItem)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
