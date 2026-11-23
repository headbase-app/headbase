import type {WorkspaceItem} from "@headbase-app/lib";
import type {PluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";

export interface WorkspacePluginMetadata extends PluginMetadata {
	icon?: string
}
export abstract class WorkspacePlugin {
	static meta: WorkspacePluginMetadata
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

export type WorkspacePluginClass = (new (...args: ConstructorParameters<typeof WorkspacePlugin>) => WorkspacePlugin) & {meta: WorkspacePluginMetadata}
