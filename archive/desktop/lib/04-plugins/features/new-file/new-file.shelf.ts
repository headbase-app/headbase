import {AppShelfPlugin, AppShelfPluginMetadata} from "../../../02-apis/plugin/app-shelf-plugin/app-shelf-plugin.ts";

const NewFileShelfMetadata = {
	id: "https://spec.headbase.app/v1/shelf/new-file",
	name: "Create New File",
	description: "A core Headbase plugin to create a new file",
	icon: "plus"
} satisfies AppShelfPluginMetadata

export class NewFileShelfItem extends AppShelfPlugin {
	static meta: AppShelfPluginMetadata = NewFileShelfMetadata

	async trigger() {
		this.apis.workspaceAPI.open({type: "plugin", plugin: "https://spec.headbase.app/v1/workspace/new-file"})
	}
}
