import {IDeviceAPI, IFilesAPI, IPluginStore} from "@headbase-app/lib";
import {FileEditorPluginClass} from "./editor-plugin.ts";
import {SourcePluginClass} from "./source-plugin/source-plugin.ts";
import {ViewPluginClass} from "./view-plugin.ts";

export interface BasePluginMetadata {
	id: string,
	name: string,
	description: string,
}

export interface PluginExposedAPIs {
	deviceAPI: IDeviceAPI
	filesAPI: IFilesAPI
	// todo: plugins shouldn't be exposed to plugins?
	pluginAPI: IPluginStore
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
	registerSource!: (editor: SourcePluginClass) => void;
	registerView!: (editor: ViewPluginClass) => void;
}

export type BasePluginClass = (new (...args: ConstructorParameters<typeof BasePlugin>) => BasePlugin) & {meta: BasePluginMetadata}
