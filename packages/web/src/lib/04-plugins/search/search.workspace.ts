import {
	WorkspacePlugin,
	type WorkspacePluginMetadata
} from "../../02-apis/plugin/workspace-plugin/workspace-plugin.ts";

export const SEARCH_WORKSPACE_ID = "https://spec.headbase.app/v1/workspace/search"
const FileEditorWorkspaceMetadata = {
	id: SEARCH_WORKSPACE_ID,
	name: "Search",
	description: "A core plugin providing search functionality.",
	icon: "search"
} satisfies WorkspacePluginMetadata

export class SearchWorkspaceItem extends WorkspacePlugin {
	static meta: WorkspacePluginMetadata = FileEditorWorkspaceMetadata

	async load() {
		this.apis.workspaceAPI.update(this.workspaceItem.id, {name: "Search"})

		const item = document.createElement("hb-search");
		this.container.append(item);
	}

	async unload() {
		this.container.innerHTML = '';
	}
}
