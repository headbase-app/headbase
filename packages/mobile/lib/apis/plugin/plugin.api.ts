import type {IDeviceAPI} from "../device/device.api";
import type {IFilesAPI} from "../files/files.api";
import type {FilePlugin} from "./file-plugin.ts";

export interface PluginAPIs {
	deviceAPI: IDeviceAPI
	filesAPI: IFilesAPI
	pluginAPI: IPluginAPI
}

export interface BasePlugin {
	// Plugins should define their own type: PLUGIN_TYPES
	id: string,
	name: string,
	description: string,
}

export enum PLUGIN_TYPES {
	FILE = "file"
}

export interface Plugin {
	id: string,
	name: string
	description: string
	plugins: FilePlugin[]
}

export interface IPluginAPI {
	registerPlugin: (plugin: Plugin) => void
	getFilePlugins: () => Promise<FilePlugin[]>
}
