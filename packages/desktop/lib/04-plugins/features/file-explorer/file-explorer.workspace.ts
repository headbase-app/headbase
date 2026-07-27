import {
	WorkspaceItemPlugin,
	WorkspaceItemPluginMetadata
} from "../../../02-apis/plugin/plugins/workspace-item-plugin.ts";

export const FILE_EXPLORER_WORKSPACE_ID = "https://spec.headbase.app/v1/workspace/file-explorer"
const FileExplorerWorkspaceMetadata = {
	id: FILE_EXPLORER_WORKSPACE_ID,
	name: "File Explorer",
	description: "Explore your files in a traditional file-system tree structure.",
	icon: "folder"
} satisfies WorkspaceItemPluginMetadata

export class FileExplorerWorkspaceItem extends WorkspaceItemPlugin {
	static meta: WorkspaceItemPluginMetadata = FileExplorerWorkspaceMetadata

	async load() {
		const editor = document.createElement("hb-file-explorer");
		this.container.append(editor);
	}

	async unload() {
		this.container.innerHTML = '';
	}
}
