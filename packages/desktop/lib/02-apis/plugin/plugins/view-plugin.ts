import {BasePluginMetadata, PluginExposedAPIs} from "./base-plugin.ts";

export interface ViewMetadata extends BasePluginMetadata {
	icon?: string
}

export abstract class ViewPlugin {
	static meta: ViewMetadata
	apis: PluginExposedAPIs

	constructor(apis: PluginExposedAPIs) {
		this.apis = apis
	}
}

export type ViewPluginClass = (new (...args: ConstructorParameters<typeof ViewPlugin>) => ViewPlugin) & {meta: ViewMetadata}
