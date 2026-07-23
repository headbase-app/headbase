import {BasePluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";
import {DataObject, queryDataObjects} from "./query-data-objects.ts";
import {DynamicFields, InferObjectFromFieldDefinitions} from "./dynamic-fields.ts";
import {EncryptionService} from "../../../encryption/encryption.service.ts";

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
		const hash = await EncryptionService.hash(JSON.stringify(this.settings) + this.objectQuery)
		const sourceHash = hash.split(".")[2] // not saving version/metadata baked into hash.
		const cacheFile = `/.headbase/cache/${sourceHash}.json`

		let cacheContent;
		try {
			const file = await this.apis.filesAPI.readAsText(cacheFile)
			cacheContent = JSON.parse(file.text)
		}
		catch (error) {
			if (error instanceof SyntaxError) {
				console.error(`[source][cache] Cache '${sourceHash}' could not be parsed and was ignored.`)
			}
		}

		if (cacheContent) {
			console.debug(`[source][cache] Loaded source data from cache (${sourceHash})`)
			return cacheContent
		}

		let results = await this.load()
		if (this.objectQuery) {
			results = queryDataObjects(this.objectQuery, results)
		}

		await this.apis.filesAPI.writeText(cacheFile, JSON.stringify(results))

		return results
	}
}

export type SourcePluginClass = (new (...args: ConstructorParameters<typeof SourcePlugin>) => SourcePlugin) & {meta: SourceMetadata}
