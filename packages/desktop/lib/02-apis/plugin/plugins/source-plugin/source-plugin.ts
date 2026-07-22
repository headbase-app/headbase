import {BasePluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";
import {DataObject, queryDataObjects} from "./query-data-objects.ts";
import {DynamicFields, InferObjectFromFieldDefinitions} from "./dynamic-fields.ts";

export interface SourceMetadata extends BasePluginMetadata {
	icon?: string
	settings?: DynamicFields
}

export abstract class SourcePlugin {
	static meta: SourceMetadata
	apis: PluginExposedAPIs
	// todo: should be unknown?
	settings: InferObjectFromFieldDefinitions<any>
	objectQuery?: string | null

	constructor(
		apis: PluginExposedAPIs,
		settings: InferObjectFromFieldDefinitions<any>,
		objectQuery?: string | null
	) {
		this.apis = apis
		this.settings = settings
		this.objectQuery = objectQuery
	}

	abstract load(): Promise<DataObject[]>

	async query() {
		const results = await this.load()

		if (this.objectQuery) {
			return queryDataObjects(this.objectQuery, results)
		}

		return results
	}
}

export type SourcePluginClass = (new (...args: ConstructorParameters<typeof SourcePlugin>) => SourcePlugin) & {meta: SourceMetadata}
