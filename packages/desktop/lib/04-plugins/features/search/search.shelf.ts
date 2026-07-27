import {ShelfItemPlugin, ShelfItemPluginMetadata} from "../../../02-apis/plugin/plugins/shelf-item-plugin.ts";

const SearchShelfMetadata = {
	id: "https://spec.headbase.app/v1/shelf/search",
	name: "Search",
	description: "Search content",
	icon: "search"
} satisfies ShelfItemPluginMetadata

export class SearchShelfItem extends ShelfItemPlugin {
	static meta: ShelfItemPluginMetadata = SearchShelfMetadata

	async trigger() {
		this.apis.workspaceAPI.open({type: "plugin", plugin: "https://spec.headbase.app/v1/workspace/search"})
	}
}
