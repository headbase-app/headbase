import {IDeviceAPI, IFilesAPI} from "@headbase-app/lib";
import {FileEditorPluginClass} from "./editor-plugin.ts";
import {DataSourcePluginClass} from "./data-source-plugin.ts";
import {ViewPluginClass} from "./view-plugin.ts";

export interface BasePluginMetadata {
	id: string,
	name: string,
	description: string,
}

export interface PluginExposedAPIs {
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

	registerEditor!: (editor: FileEditorPluginClass) => void;
	registerViewSource!: (editor: DataSourcePluginClass) => void;
	registerViewDisplay!: (editor: ViewPluginClass) => void;
}

export type BasePluginClass = (new (...args: ConstructorParameters<typeof BasePlugin>) => BasePlugin) & {meta: BasePluginMetadata}
