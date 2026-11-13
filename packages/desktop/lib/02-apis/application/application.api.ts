import {BasePluginClass, FileEditorPluginClass, ViewDisplayPluginClass, ViewSourcePluginClass} from "@headbase-app/lib";
import {AppShelfPluginClass} from "../plugin/app-shelf-plugin/app-shelf-plugin.ts";
import {WorkspaceItemPluginClass} from "../plugin/workspace-item-plugin/workspace-item-plugin.ts";

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
	getShelfItems: () => Promise<AppShelfPluginClass[]>
	getShelfById: (id: string) => Promise<AppShelfPluginClass | null>
	getWorkspaceItems: () => Promise<WorkspaceItemPluginClass[]>
	getWorkspaceItemById: (id: string) => Promise<WorkspaceItemPluginClass | null>
}
