import {BasePlugin, BasePluginMetadata} from "../../../02-apis/plugin/base-plugin.ts";
import {FileExplorerShelfItem} from "./file-explorer.shelf.ts";
import {FileExplorerWorkspaceItem} from "./file-explorer.workspace.ts";

import "./components/file-explorer.ts"
import "./components/file-tree-item.ts"

export const FILE_EXPLORER_PLUGIN_ID = "https://spec.headbase.app/v1/plugins/file-explorer"

export class FileExplorerPlugin extends BasePlugin {
	meta: BasePluginMetadata = {
		id: FILE_EXPLORER_PLUGIN_ID,
		name: "File Explorer",
		description: "A core plugin providing file explorer functionality.",
	}

	async load() {
		this.registerShelfItem(FileExplorerShelfItem)
		this.registerWorkspaceItem(FileExplorerWorkspaceItem)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
