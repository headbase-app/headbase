import {IDeviceAPI, IFilesAPI, IApplicationAPI, IWorkspaceAPI} from "@headbase-app/lib";
import {FileEditorPluginClass} from "./plugins/editor-plugin.ts";
import {ViewSourcePluginClass} from "./plugins/view-source-plugin/view-source-plugin.ts";
import {ViewDisplayPluginClass} from "./plugins/view-display-plugin.ts";
import {ShelfItemPluginClass} from "./plugins/shelf-item-plugin.ts";
import {WorkspaceItemPluginClass} from "./plugins/workspace-item-plugin.ts";

export interface BasePluginMetadata {
	id: string,
	name: string,
	description: string,
}

// todo: review what/how APIs are exposed to restrict access to "internal" APIs
export interface PluginExposedAPIs {
	applicationAPI: IApplicationAPI
	workspaceAPI: IWorkspaceAPI
	deviceAPI: IDeviceAPI
	filesAPI: IFilesAPI
}

export interface PluginMetadata {
	id: string,
	name: string,
	description: string,
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
	registerShelfItem!: (item: ShelfItemPluginClass) => void;
	registerWorkspaceItem!: (item: WorkspaceItemPluginClass) => void;
}

export type BasePluginClass = (new (...args: ConstructorParameters<typeof BasePlugin>) => BasePlugin) & {meta: BasePluginMetadata}
