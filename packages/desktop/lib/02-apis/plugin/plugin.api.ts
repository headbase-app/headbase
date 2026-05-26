import type {IDeviceAPI} from "../device/device.api";
import type {IFilesAPI} from "../files/files.api";

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
	registerView!: (editor: ViewPluginClass) => void;
}

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

export interface ViewMetadata extends BasePluginMetadata{
	icon?: string
}

export abstract class ViewPlugin {
	static meta: ViewMetadata
	apis: PluginExposedAPIs

	constructor(apis: PluginExposedAPIs) {
		this.apis = apis
	}
}

export type BasePluginClass = (new (...args: ConstructorParameters<typeof BasePlugin>) => BasePlugin) & {meta: BasePluginMetadata}
export type FileEditorPluginClass = (new (...args: ConstructorParameters<typeof FileEditorPlugin>) => FileEditorPlugin) & {meta: FileEditorMetadata}
export type ViewPluginClass = (new (...args: ConstructorParameters<typeof ViewPlugin>) => ViewPlugin) & {meta: ViewMetadata}
export type PluginClass = FileEditorPluginClass | ViewPluginClass

export interface IPluginStore {
	registerBasePlugin: (plugin: BasePluginClass) => void
	getEditors: () => Promise<FileEditorPluginClass[]>
	getViews: () => Promise<ViewPluginClass[]>
}
