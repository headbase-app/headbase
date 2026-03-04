import {PLUGIN_TYPES, type PluginAPIs, type BasePlugin} from "./plugin.api.ts";

export interface FilePluginEditorProps {
	apis: PluginAPIs
	filePath: string
	container: HTMLElement
	document: Document
}
export interface FilePluginEditorMethods {
	close: () => Promise<void>
	save?: () => Promise<void>
}
export type FilePluginEditor = (props: FilePluginEditorProps) => Promise<FilePluginEditorMethods>

export interface FilePlugin extends BasePlugin {
	type: PLUGIN_TYPES.FILE
	fileIcon?: string,
	fileExtensions: string[]
	editor: FilePluginEditor
}
