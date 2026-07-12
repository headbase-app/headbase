import {BasePluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";
import {DataObject} from "./query-data-objects.ts";
import {DynamicFields, InferObjectFromFieldDefinitions} from "./dynamic-fields.ts";

export interface SourceMetadata extends BasePluginMetadata {
	icon?: string
	settings?: DynamicFields
}

export abstract class SourcePlugin {
	static meta: SourceMetadata
	apis: PluginExposedAPIs

	constructor(apis: PluginExposedAPIs) {
		this.apis = apis
	}

	abstract query(settings: InferObjectFromFieldDefinitions<any>): Promise<DataObject[]>
}

export type SourcePluginClass = (new (...args: ConstructorParameters<typeof SourcePlugin>) => SourcePlugin) & {meta: SourceMetadata}
