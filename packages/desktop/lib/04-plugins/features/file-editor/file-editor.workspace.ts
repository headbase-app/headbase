import {
	WorkspaceItemPlugin,
	WorkspaceItemPluginMetadata
} from "../../../02-apis/plugin/plugins/workspace-item-plugin.ts";
import {FileEditor} from "./components/file-editor.ts";

export const FILE_EDITOR_WORKSPACE_ID = "https://spec.headbase.app/v1/plugins/file"
const FileEditorWorkspaceMetadata = {
	id: FILE_EDITOR_WORKSPACE_ID,
	name: "File Editor",
	description: "A core plugin providing file editing functionality.",
	icon: "file"
} satisfies WorkspaceItemPluginMetadata

export class FileEditorWorkspaceItem extends WorkspaceItemPlugin {
	static meta: WorkspaceItemPluginMetadata = FileEditorWorkspaceMetadata

	async load(filePath: string) {
		// todo: validation of load args should be built into plugin definition?
		if (!filePath || typeof filePath !== 'string') {
			console.error(`[editor] No file path found when opening file editor workspace item.`)
			return;
		}
		this.apis.workspaceAPI.update(this.workspaceItem.id, {name: filePath})

		const item = document.createElement("hb-file-editor") as FileEditor;
		item.filePath = filePath
		this.container.append(item);
	}

	async unload() {
		this.container.innerHTML = '';
	}
}
