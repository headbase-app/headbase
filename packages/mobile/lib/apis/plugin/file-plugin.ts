import {PLUGIN_TYPES, type PluginAPIs, type BasePlugin} from "./plugin.api.ts";

export interface FilePluginProps {
	apis: PluginAPIs
	filePath: string
	container: HTMLElement
	document: Document
}

export interface FilePluginReturn {
	close: () => Promise<void>
	save?: () => Promise<void>
}

export type FilePluginRun = (injected: FilePluginProps) => Promise<FilePluginReturn>

export type FilePluginSupportedCheck = (filePath: string) => boolean

export interface FilePlugin extends BasePlugin {
	type: PLUGIN_TYPES.FILE
	supportedExtensions: string[]
	run: FilePluginRun
}
