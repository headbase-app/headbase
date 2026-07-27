import {BasePluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";

export interface ShelfItemPluginMetadata extends BasePluginMetadata {
	icon: string
}
export abstract class ShelfItemPlugin {
	static meta: ShelfItemPluginMetadata
	apis: PluginExposedAPIs

	constructor(apis: PluginExposedAPIs) {
		this.apis = apis
	}

	abstract trigger(): Promise<void>;
}

export type ShelfItemPluginClass = (new (...args: ConstructorParameters<typeof ShelfItemPlugin>) => ShelfItemPlugin) & {meta: ShelfItemPluginMetadata}
