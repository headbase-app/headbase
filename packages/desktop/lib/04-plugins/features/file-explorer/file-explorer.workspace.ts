import {
	WorkspaceItemPlugin,
	WorkspaceItemPluginMetadata
} from "../../../02-apis/plugin/plugins/workspace-item-plugin.ts";
import {FileExplorer} from "@headbase-app/lib";

export const FILE_EXPLORER_WORKSPACE_ID = "https://spec.headbase.app/v1/workspace/file-explorer"
const FileExplorerWorkspaceMetadata = {
	id: FILE_EXPLORER_WORKSPACE_ID,
	name: "File Explorer",
	description: "Explore your files in a traditional file-system tree structure.",
	icon: "folder"
} satisfies WorkspaceItemPluginMetadata

export class FileExplorerWorkspaceItem extends WorkspaceItemPlugin {
	static meta: WorkspaceItemPluginMetadata = FileExplorerWorkspaceMetadata

	async load(filePath?: string) {
		// todo: validation of load args should be built into plugin definition?
		if (filePath && typeof filePath !== 'string') return

		this.apis.workspaceAPI.update(this.workspaceItem.id, {name: filePath ?? "/"})

		const item = document.createElement("hb-file-explorer") as FileExplorer;
		item.filePath = filePath
		this.container.append(item);
	}

	async unload() {
		this.container.innerHTML = '';
	}
}
