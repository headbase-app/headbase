import type {PluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";
import {DataObject, queryDataObjects} from "./query-data-objects.ts";
import {DynamicFields} from "./dynamic-fields.ts";
import type {InferObjectFromFieldDefinitions} from "./dynamic-fields.ts";
import {EncryptionService} from "../../encryption/encryption.service.ts";

export interface ViewSourceMetadata extends PluginMetadata {
	icon?: string
	settings?: DynamicFields
}

export abstract class ViewSourcePlugin {
	static meta: ViewSourceMetadata
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
		return []
	}
}

export type ViewSourcePluginClass = (new (...args: ConstructorParameters<typeof ViewSourcePlugin>) => ViewSourcePlugin) & {meta: ViewSourceMetadata}
