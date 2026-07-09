import {BasePluginMetadata, PluginExposedAPIs} from "./base-plugin.ts";

export interface DataSourceMetadata extends BasePluginMetadata {
	icon?: string
	settings?: FieldDefinitions
}

export abstract class DataSourcePlugin {
	static meta: DataSourceMetadata
	apis: PluginExposedAPIs

	constructor(apis: PluginExposedAPIs) {
		this.apis = apis
	}

	abstract query(settings: InferDataFromFieldDefinitions<any>): string[]
}

export type DataSourcePluginClass = (new (...args: ConstructorParameters<typeof DataSourcePlugin>) => DataSourcePlugin) & {meta: DataSourceMetadata}

export interface FieldBase {
	label: string
	icon?: string
	hint?: string
}

export interface FieldTypesLookup {
	"short-text": {
		type: "short-text",
		defaultValue?: string
	},
	"long-text": {
		type: "long-text",
		defaultValue?: string
	},
	"glob": {
		type: "glob",
		defaultValue?: string
	},
	"email": {
		type: "email",
		defaultValue?: string
	},
	"phone": {
		type: "phone",
		defaultValue?: string
	},
	"number": {
		type: "number",
		defaultValue?: string
	},
	"range": {
		type: "range",
		defaultValue?: string,
		settings: {
			min: number
			max: number
		}
	},
	"checkbox": {
		type: "checkbox",
		defaultValue?: boolean
	},
	"select": {
		type: "select",
		defaultValue?: string,
		settings: {
			options: string[]
		}
	},
	"multi-select": {
		type: "multi-select",
		defaultValue?: string,
		settings: {
			options: string[]
		}
	}
}
export type FieldTypes = FieldBase & FieldTypesLookup[keyof FieldTypesLookup]

export interface FieldDefinitions {
	[key: string]: FieldTypes;
}

export type InferDataFromFieldDefinitions<F extends FieldDefinitions> = {
	[K in keyof F]: NonNullable<FieldTypesLookup[F[K]["type"]]["defaultValue"]>
}
