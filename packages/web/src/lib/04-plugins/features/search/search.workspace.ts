import {
	WorkspaceItemPlugin,
	type WorkspaceItemPluginMetadata
} from "../../../02-apis/plugin/workspace-item-plugin/workspace-item-plugin.ts";

export const SEARCH_WORKSPACE_ID = "https://spec.headbase.app/v1/workspace/search"
const FileEditorWorkspaceMetadata = {
	id: SEARCH_WORKSPACE_ID,
	name: "Search",
	description: "A core plugin providing search functionality.",
	icon: "search"
} satisfies WorkspaceItemPluginMetadata

export class SearchWorkspaceItem extends WorkspaceItemPlugin {
	static meta: WorkspaceItemPluginMetadata = FileEditorWorkspaceMetadata

	async load() {
		this.apis.workspaceAPI.update(this.workspaceItem.id, {name: "Search"})

		const item = document.createElement("hb-search");
		this.container.append(item);
	}

	async unload() {
		this.container.innerHTML = '';
	}
}
