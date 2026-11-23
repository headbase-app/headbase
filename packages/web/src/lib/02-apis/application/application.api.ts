import type {BasePluginClass, EditorPluginClass} from "@headbase-app/lib";
import type {AppShelfPluginClass} from "../plugin/app-shelf-plugin/app-shelf-plugin.ts";
import type {WorkspacePluginClass} from "../plugin/workspace-plugin/workspace-plugin.ts";

export interface IApplicationAPI {
	// Plugins
	registerPlugin: (plugin: BasePluginClass) => void
	// Plugin "internals" - todo: should be
	getEditors: () => Promise<EditorPluginClass[]>
	getEditorById: (id: string) => Promise<EditorPluginClass | null>
	getShelfItems: () => Promise<AppShelfPluginClass[]>
	getShelfById: (id: string) => Promise<AppShelfPluginClass | null>
	getWorkspaceItems: () => Promise<WorkspacePluginClass[]>
	getWorkspaceItemById: (id: string) => Promise<WorkspacePluginClass | null>
}
