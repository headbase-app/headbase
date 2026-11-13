import {WorkspaceItem} from "@headbase-app/lib";
import {PluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";

export interface WorkspaceItemPluginMetadata extends PluginMetadata {
	icon?: string
}
export abstract class WorkspaceItemPlugin {
	static meta: WorkspaceItemPluginMetadata
	apis: PluginExposedAPIs
	container: HTMLElement
	workspaceItem: WorkspaceItem

	constructor(apis: PluginExposedAPIs, container: HTMLElement, workspaceItem: WorkspaceItem) {
		this.apis = apis
		this.container = container
		this.workspaceItem = workspaceItem
	}

	abstract load(...data: unknown[]): Promise<void>;
	abstract unload(): Promise<void>;
}

export type WorkspaceItemPluginClass = (new (...args: ConstructorParameters<typeof WorkspaceItemPlugin>) => WorkspaceItemPlugin) & {meta: WorkspaceItemPluginMetadata}
