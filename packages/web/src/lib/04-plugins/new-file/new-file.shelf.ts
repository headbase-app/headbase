import {AppShelfPlugin} from "../../02-apis/plugin/app-shelf-plugin/app-shelf-plugin.ts";
import type {AppShelfPluginMetadata} from "../../02-apis/plugin/app-shelf-plugin/app-shelf-plugin.ts";

const NewFileShelfMetadata = {
	id: "https://spec.headbase.app/v1/shelf/new",
	name: "New Document",
	description: "A core Headbase plugin to create a new document",
	icon: "plus"
} satisfies AppShelfPluginMetadata

export class NewFileShelfItem extends AppShelfPlugin {
	static meta: AppShelfPluginMetadata = NewFileShelfMetadata

	async trigger() {
		this.apis.workspaceAPI.open({type: "document"})
	}
}
