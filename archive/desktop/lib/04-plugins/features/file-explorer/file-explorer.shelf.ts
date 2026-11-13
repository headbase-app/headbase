import {AppShelfPlugin, AppShelfPluginMetadata} from "../../../02-apis/plugin/app-shelf-plugin/app-shelf-plugin.ts";

export const FILE_EXPLORER_SHELF_ID = "https://spec.headbase.app/v1/shelf/file-explorer"
const FileExplorerShelfMetadata = {
	id: FILE_EXPLORER_SHELF_ID,
	name: "File Explorer",
	description: "Explore your files in a traditional file-system tree structure.",
	icon: "folder"
} satisfies AppShelfPluginMetadata

export class FileExplorerShelfItem extends AppShelfPlugin {
	static meta: AppShelfPluginMetadata = FileExplorerShelfMetadata

	async trigger() {
		this.apis.workspaceAPI.open({type: "plugin", plugin: "https://spec.headbase.app/v1/workspace/file-explorer"})
	}
}
