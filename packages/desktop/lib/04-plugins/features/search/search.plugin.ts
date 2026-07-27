import {BasePlugin, BasePluginMetadata} from "../../../02-apis/plugin/base-plugin.ts";
import {SearchShelfItem} from "./search.shelf.ts";


export class SearchPlugin extends BasePlugin {
	meta: BasePluginMetadata = {
		id: "https://spec.headbase.app/v1/plugins/search",
		name: "Search",
		description: "A core plugin providing the ability to search files.",
	}

	async load() {
		this.registerShelfItem(SearchShelfItem)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
