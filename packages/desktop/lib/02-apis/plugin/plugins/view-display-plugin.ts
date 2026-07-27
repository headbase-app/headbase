import {BasePluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";
import {DynamicFields, InferObjectFromFieldDefinitions} from "./view-source-plugin/dynamic-fields.ts";
import {ViewSourcePlugin} from "./view-source-plugin/view-source-plugin.ts";

export interface ViewDisplayMetadata extends BasePluginMetadata {
	icon?: string
	settings?: DynamicFields
}

export abstract class ViewDisplayPlugin {
	static meta: ViewDisplayMetadata
	apis: PluginExposedAPIs
	container: HTMLElement
	sources: ViewSourcePlugin[]

	constructor(
		apis: PluginExposedAPIs,
		container: HTMLElement,
		sources: ViewSourcePlugin[]
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

export type ViewDisplayPluginClass = (new (...args: ConstructorParameters<typeof ViewDisplayPlugin>) => ViewDisplayPlugin) & {meta: ViewDisplayMetadata}
