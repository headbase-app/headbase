import {AppShelfPlugin, AppShelfPluginMetadata} from "../../../02-apis/plugin/app-shelf-plugin/app-shelf-plugin.ts";

const ContentTypesShelfMetadata = {
	id: "https://spec.headbase.app/v1/shelf/content-types",
	name: "Content Types",
	description: "Manage your content types",
	icon: "shapes"
} satisfies AppShelfPluginMetadata

export class ContentTypesShelfItem extends AppShelfPlugin {
	static meta: AppShelfPluginMetadata = ContentTypesShelfMetadata

	async trigger() {
		this.apis.workspaceAPI.open({type: "plugin", plugin: "https://spec.headbase.app/v1/workspace/content-types"})
	}
}
