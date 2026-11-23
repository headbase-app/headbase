import type {IDeviceAPI, IApplicationAPI, IWorkspaceAPI} from "@headbase-app/lib";
import {IMatterDatabase} from "@headbase-app/matter";

import type {EditorPluginClass} from "./editor-plugin/editor-plugin.ts";
import type {AppShelfPluginClass} from "./app-shelf-plugin/app-shelf-plugin.ts";
import type {WorkspacePluginClass} from "./workspace-plugin/workspace-plugin.ts";

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
	registerEditor!: (editor: EditorPluginClass) => void;
	registerShelfItem!: (item: AppShelfPluginClass) => void;
	registerWorkspaceItem!: (item: WorkspacePluginClass) => void;
}

export type BasePluginClass = (new (...args: ConstructorParameters<typeof BasePlugin>) => BasePlugin) & {meta: PluginMetadata}
