import {BasePluginMetadata, PluginExposedAPIs} from "./base-plugin.ts";

export interface FileEditorMetadata extends BasePluginMetadata {
	icon?: string,
	supportedExtensions: string[]
}
export abstract class FileEditorPlugin {
	static meta: FileEditorMetadata
	apis: PluginExposedAPIs
	container: HTMLElement
	filePath: string

	constructor(apis: PluginExposedAPIs, container: HTMLElement, filePath: string) {
		this.apis = apis
		this.container = container
		this.filePath = filePath
	}

	abstract load(): Promise<void>;
	abstract unload(): Promise<void>;
	save?(): Promise<void>;
}

export type FileEditorPluginClass = (new (...args: ConstructorParameters<typeof FileEditorPlugin>) => FileEditorPlugin) & {meta: FileEditorMetadata}
