import {TagData} from "./entities/tags";
import {FieldDefinition} from "./entities/fields/fields";
import {ContentTypeData} from "./entities/content-types";
import {ContentData} from "./entities/content";
import {ViewData} from "./entities/views";

export const DATABASE_SCHEMA = {
	version: 1.1,
	tables: {
		tags: {
			currentSchema: 'v1',
			schemas: {
				v1: {
					validator: (d: unknown) => TagData.parse(d),
					exposedFields: null,
				}
			},
			migrateSchema: null,
			useMemoryCache: true,
		},
		fields: {
			currentSchema: 'v1',
			schemas: {
				v1: {
					validator: (d: unknown) => FieldDefinition.parse(d),
					exposedFields: null
				}
			},
			migrateSchema: null,
			useMemoryCache: true,
		},
		content_types: {
			currentSchema: 'v1',
			schemas: {
				v1: {
					validator: (d: unknown) => ContentTypeData.parse(d),
					exposedFields: {fields: 'plain', contentTemplateTags: 'plain'}
				}
			},
			migrateSchema: null,
			useMemoryCache: true,
		},
		content: {
			currentSchema: 'v1',
			schemas: {
				v1: {
					validator: (d: unknown) => ContentData.parse(d),
					exposedFields: {type: 'indexed', tags: 'plain', isFavourite: 'plain'}
				},
			},
			migrateSchema: null,
			useMemoryCache: false,
		},
		views: {
			currentSchema: 'v1',
			schemas: {
				v1: {
					validator: (d: unknown) => ViewData.parse(d),
					exposedFields: {isFavourite: 'plain', tags: 'plain', queryTags: 'plain', queryContentTypes: 'plain'}
				},
			},
			migrateSchema: null,
			useMemoryCache: false,
		}
	},
} as const
export type DatabaseSchema = typeof DATABASE_SCHEMA

export type DatabaseTables = keyof DatabaseSchema['tables']

export type TableType<TableKey extends DatabaseTables> = ReturnType<DatabaseSchema['tables'][TableKey]['schemas'][DatabaseSchema['tables'][TableKey]['currentSchema']]['validator']>

export type LocalEntityWithExposedFields<TableKey extends TableKeys> = DatabaseSchema['tables'][TableKey]