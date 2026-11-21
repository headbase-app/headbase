import {AppShelfPlugin} from "../../../02-apis/plugin/app-shelf-plugin/app-shelf-plugin.ts";
import type {AppShelfPluginMetadata} from "../../../02-apis/plugin/app-shelf-plugin/app-shelf-plugin.ts";

const SearchShelfMetadata = {
	id: "https://spec.headbase.app/v1/shelf/search",
	name: "Search",
	description: "Search content",
	icon: "search"
} satisfies AppShelfPluginMetadata

export class SearchShelfItem extends AppShelfPlugin {
	static meta: AppShelfPluginMetadata = SearchShelfMetadata

	async trigger() {
		this.apis.workspaceAPI.open({type: "plugin", plugin: "https://spec.headbase.app/v1/workspace/search"})
	}
}
