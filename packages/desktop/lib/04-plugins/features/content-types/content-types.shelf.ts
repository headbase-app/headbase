import {ShelfItemPlugin, ShelfItemPluginMetadata} from "../../../02-apis/plugin/plugins/shelf-item-plugin.ts";

const ContentTypesShelfMetadata = {
	id: "https://spec.headbase.app/v1/shelf/content-types",
	name: "Content Types",
	description: "Manage your content types",
	icon: "shapes"
} satisfies ShelfItemPluginMetadata

export class ContentTypesShelfItem extends ShelfItemPlugin {
	static meta: ShelfItemPluginMetadata = ContentTypesShelfMetadata

	async trigger() {
		this.apis.workspaceAPI.open({type: "plugin", plugin: "https://spec.headbase.app/v1/workspace/content-types"})
	}
}
