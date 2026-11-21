import type {IDeviceAPI, IApplicationAPI, IWorkspaceAPI} from "@headbase-app/lib";
import {IMatterDatabase} from "@headbase-app/matter";

import type {FileEditorPluginClass} from "./editor-plugin/editor-plugin.ts";
import type {ViewSourcePluginClass} from "./view-source-plugin/view-source-plugin.ts";
import type {ViewDisplayPluginClass} from "./view-display-plugin/view-display-plugin.ts";
import type {AppShelfPluginClass} from "./app-shelf-plugin/app-shelf-plugin.ts";
import type {WorkspaceItemPluginClass} from "./workspace-item-plugin/workspace-item-plugin.ts";

export interface PluginMetadata {
	id: string,
	name: string,
	description: string,
}

// todo: review what/how APIs are exposed to restrict access to "internal" APIs
export interface PluginExposedAPIs {
	applicationAPI: IApplicationAPI
	workspaceAPI: IWorkspaceAPI
	deviceAPI: IDeviceAPI
	databaseAPI: IMatterDatabase
}

export abstract class BasePlugin {
	static meta: PluginMetadata
	apis: PluginExposedAPIs
	constructor(apis: PluginExposedAPIs) {
		this.apis = apis
	}

	abstract load(): Promise<void>;
	abstract unload?(): Promise<void>;

	registerPlugin!: (plugin: BasePluginClass) => void;
	registerEditor!: (editor: FileEditorPluginClass) => void;
	registerViewSource!: (editor: ViewSourcePluginClass) => void;
	registerViewDisplay!: (editor: ViewDisplayPluginClass) => void;
	registerShelfItem!: (item: AppShelfPluginClass) => void;
	registerWorkspaceItem!: (item: WorkspaceItemPluginClass) => void;
}

export type BasePluginClass = (new (...args: ConstructorParameters<typeof BasePlugin>) => BasePlugin) & {meta: PluginMetadata}
