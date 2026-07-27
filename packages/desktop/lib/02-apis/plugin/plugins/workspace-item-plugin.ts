import {BasePluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";

export interface WorkspaceItemPluginMetadata extends BasePluginMetadata {
	icon?: string
}
export abstract class WorkspaceItemPlugin {
	static meta: WorkspaceItemPluginMetadata
	apis: PluginExposedAPIs
	container: HTMLElement

	constructor(apis: PluginExposedAPIs, container: HTMLElement) {
		this.apis = apis
		this.container = container
	}

	abstract load(): Promise<void>;
	abstract unload(): Promise<void>;
}

export type WorkspaceItemPluginClass = (new (...args: ConstructorParameters<typeof WorkspaceItemPlugin>) => WorkspaceItemPlugin) & {meta: WorkspaceItemPluginMetadata}
