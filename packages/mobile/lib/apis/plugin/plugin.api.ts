import type {IDeviceAPI} from "../device/device.api.ts";
import type {IFilesAPI} from "../files/files.api.ts";
import {type AnyFilePlugin} from "./file-editor-plugins.ts";

export type InstantiablePlugin<T> = new (apis: PluginUsableAPIs) => T

export type AnyPlugin = AnyFilePlugin

export interface IPluginAPI {
	registerPlugin: (plugin: AnyPlugin) => void
	getFileEditors: () => Promise<AnyFilePlugin[]>
}

export interface PluginUsableAPIs {
	deviceAPI: IDeviceAPI
	filesAPI: IFilesAPI
	pluginAPI: IPluginAPI
}
