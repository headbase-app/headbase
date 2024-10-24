import { LocalEntity } from "../../types/data-entities";

/**
 * The base type definition passed as a generic to Localful.
 * This should be in the format 'key:<type>' where the key matches the key passed in the
 * schema definition.
 */
export type TableTypeDefinitions = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- using never/unknown seems to cause issues when trying to actually use this type.
	[key: string]: any
}

/**
 * A basic type helper for accessing the daya type keys (same as table keys)
 * '& string' is used in this type to prevent issues with 'Implicit conversion of a symbol to a string will fail at runtime'
 */
export type TableKeys<TableTypes extends TableTypeDefinitions> = keyof TableTypes & string

/**
 * The runtime schema definition and configuration passed to Localful.
 * The tables in this definition should match the keys of the passed TableTypesDefinition.
 */
export type TableSchemaDefinitions<TableTypes extends TableTypeDefinitions> = {
	version: number,
	tables: {
		[TableKey in TableKeys<TableTypes>]: {
			currentSchema: string
			schemas: {
				[key: string]: {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any -- using never/unknown seems to cause issues when trying to actually use this type.
					validator: (data: any) => Promise<boolean>
					exposedFields?: ExposedFieldsDefinition<TableTypes, TableKey>
				}
			}
			migrateSchema?: SchemaMigration<TableTypes, TableKey>
			useMemoryCache?: boolean
		}
	}
}

/**
 * The exposed fields configuration for a given data type.
 */
export type ExposedFieldsDefinition<
	TableTypes extends TableTypeDefinitions,
	TableKey extends TableKeys<TableTypes>
> = {
	[key in keyof TableTypes[TableKey]]?: 'indexed' | 'plain';
};

/**
 * The schema migration function which should run when data needs to be
 * migrated from an old schema to the most recent.
 */
export type SchemaMigration<
	TableTypes extends TableTypeDefinitions,
	TableKey extends TableKeys<TableTypes>,
> = (
	currentSchema: string,
	targetSchema: string,
	data: never
) => Promise<TableTypes[TableKey]>

/**
 * Type helper for accessing the exposed fields of a given data type.
 */
export type TableTypeExposedFields<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>,
	TableKey extends TableKeys<TableTypes>,
> = keyof TableSchemas['tables'][TableKey]['schemas'][TableSchemas['tables'][TableKey]['currentSchema']]['exposedFields']

/**
 * Type helper for creating the type for a local entity with exposed fields
 */
export type LocalEntityWithExposedFields<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>,
	TableKey extends TableKeys<TableTypes>,
> = LocalEntity & Pick<TableTypes[TableKey], TableTypeExposedFields<TableTypes, TableSchemas, TableKey>>
