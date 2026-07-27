import {ShelfItemPlugin, ShelfItemPluginMetadata} from "../../../02-apis/plugin/plugins/shelf-item-plugin.ts";

export const FILE_EXPLORER_SHELF_ID = "https://spec.headbase.app/v1/shelf/file-explorer"
const FileExplorerShelfMetadata = {
	id: FILE_EXPLORER_SHELF_ID,
	name: "File Explorer",
	description: "Explore your files in a traditional file-system tree structure.",
	icon: "folder"
} satisfies ShelfItemPluginMetadata

export class FileExplorerShelfItem extends ShelfItemPlugin {
	static meta: ShelfItemPluginMetadata = FileExplorerShelfMetadata

	async trigger() {
		this.apis.workspaceAPI.open({type: "plugin", plugin: "https://spec.headbase.app/v1/workspace/file-explorer"})
	}
}
