import {TagData} from "./tags/tags";
import {FieldDefinition} from "./fields/fields";
import {ContentTypeData} from "./content-types/content-types";
import {ContentData} from "./content/content";
import {ViewData} from "./views/views";
import {TableSchemaDefinitions} from "@headbase-toolkit/schemas/tables";

export type TableTypes = {
	tags: TagData
	fields: FieldDefinition
	content_types: ContentTypeData,
	content: ContentData,
	views: ViewData,
}

export const TableSchema = {
	version: 1.1,
	tables: {
		tags: {
			currentSchema: 'v1',
			schemas: {
				v1: {
					validator: async (d: unknown) => TagData.safeParse(d).success
				}
			},
			useMemoryCache: true,
		},
		fields: {
			currentSchema: 'v1',
			schemas: {
				v1: {
					validator: async (d: unknown) => FieldDefinition.safeParse(d).success
				}
			},
			useMemoryCache: true,
		},
		content_types: {
			currentSchema: 'v1',
			schemas: {
				v1: {
					validator: async (d: unknown) => ContentTypeData.safeParse(d).success,
					exposedFields: {fields: 'plain', contentTemplateTags: 'plain'}
				}
			},
			useMemoryCache: true,
		},
		content: {
			currentSchema: 'v1',
			schemas: {
				v1: {
					validator: async (d: unknown) => ContentData.safeParse(d).success,
					exposedFields: {type: 'indexed', tags: 'plain', isFavourite: 'plain'}
				},
			},
			useMemoryCache: false,
		},
		views: {
			currentSchema: 'v1',
			schemas: {
				v1: {
					validator: async (d: unknown) => ViewData.safeParse(d).success,
					exposedFields: {isFavourite: 'plain', tags: 'plain', queryTags: 'plain', queryContentTypes: 'plain'}
				},
			},
			useMemoryCache: false,
		}
	},
} as const satisfies TableSchemaDefinitions<TableTypes>
export type TableSchema = typeof TableSchema
