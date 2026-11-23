import {AppShelfPlugin} from "../../02-apis/plugin/app-shelf-plugin/app-shelf-plugin.ts";
import type {AppShelfPluginMetadata} from "../../02-apis/plugin/app-shelf-plugin/app-shelf-plugin.ts";

const TypesShelfMetadata = {
	id: "https://spec.headbase.app/v1/shelf/types",
	name: "Types",
	description: "Manage your document types",
	icon: "shapes"
} satisfies AppShelfPluginMetadata

export class ContentTypesShelfItem extends AppShelfPlugin {
	static meta: AppShelfPluginMetadata = TypesShelfMetadata

	async trigger() {
		this.apis.workspaceAPI.open({type: "plugin", plugin: "https://spec.headbase.app/v1/workspace/types"})
	}
}
