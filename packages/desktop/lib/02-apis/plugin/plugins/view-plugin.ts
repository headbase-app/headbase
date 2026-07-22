import {BasePluginMetadata, PluginExposedAPIs} from "./base-plugin.ts";
import {DynamicFields, InferObjectFromFieldDefinitions} from "./source-plugin/dynamic-fields.ts";
import {SourcePlugin} from "./source-plugin/source-plugin.ts";

export interface ViewMetadata extends BasePluginMetadata {
	icon?: string
	settings?: DynamicFields
}

export abstract class ViewPlugin {
	static meta: ViewMetadata
	apis: PluginExposedAPIs
	container: HTMLElement
	sources: SourcePlugin[]

	constructor(
		apis: PluginExposedAPIs,
		container: HTMLElement,
		sources: SourcePlugin[]
	) {
		this.apis = apis
		this.container = container
		this.sources = sources
	}

	abstract load(
		settings: InferObjectFromFieldDefinitions<any>
	): Promise<void>
	abstract reload(): Promise<void>;
	abstract unload(): Promise<void>;
}

export type ViewPluginClass = (new (...args: ConstructorParameters<typeof ViewPlugin>) => ViewPlugin) & {meta: ViewMetadata}
