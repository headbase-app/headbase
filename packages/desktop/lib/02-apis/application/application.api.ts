import {BasePluginClass, FileEditorPluginClass, ViewDisplayPluginClass, ViewSourcePluginClass} from "@headbase-app/lib";
import {ShelfItemPluginClass} from "../plugin/plugins/shelf-item-plugin.ts";
import {WorkspaceItemPluginClass} from "../plugin/plugins/workspace-item-plugin.ts";

export interface IApplicationAPI {
	// Plugins
	registerPlugin: (plugin: BasePluginClass) => void
	// Plugin "internals" - todo: should be
	getEditors: () => Promise<FileEditorPluginClass[]>
	getEditorById: (id: string) => Promise<FileEditorPluginClass | null>
	getViewSources: () => Promise<ViewSourcePluginClass[]>
	getViewSourceById: (id: string) => Promise<ViewSourcePluginClass | null>
	getViewDisplays : () => Promise<ViewDisplayPluginClass[]>
	getViewDisplayById: (id: string) => Promise<ViewDisplayPluginClass | null>
	getShelfItems: () => Promise<ShelfItemPluginClass[]>
	getShelfById: (id: string) => Promise<ShelfItemPluginClass | null>
	getWorkspaceItems: () => Promise<WorkspaceItemPluginClass[]>
	getWorkspaceItemById: (id: string) => Promise<WorkspaceItemPluginClass | null>
}
