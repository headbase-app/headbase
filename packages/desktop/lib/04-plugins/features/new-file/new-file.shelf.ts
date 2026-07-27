import {ShelfItemPlugin, ShelfItemPluginMetadata} from "../../../02-apis/plugin/plugins/shelf-item-plugin.ts";

const NewFileShelfMetadata = {
	id: "https://spec.headbase.app/v1/shelf/new-file",
	name: "Create New File",
	description: "A core Headbase plugin to create a new file",
	icon: "plus"
} satisfies ShelfItemPluginMetadata

export class NewFileShelfItem extends ShelfItemPlugin {
	static meta: ShelfItemPluginMetadata = NewFileShelfMetadata

	async trigger() {
		this.apis.workspaceAPI.open({type: "plugin", plugin: "https://spec.headbase.app/v1/workspace/new-file"})
	}
}
