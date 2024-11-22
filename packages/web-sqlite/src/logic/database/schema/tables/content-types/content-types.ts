import {sqliteTable, text} from "drizzle-orm/sqlite-core";
import {BaseCreateDto, BaseEntityDto, BaseVersionDto, commonEntityFields, commonFields, commonVersionFields} from "../../common.ts";
import {FieldStorage} from "../fields/field-storage.ts";

export const contentTypes = sqliteTable('content_types', {
	...commonFields,
	...commonEntityFields,
});

export const contentTypesVersions = sqliteTable('content_types_versions', {
	...commonFields,
	...commonVersionFields,
	name: text().notNull(),
	icon: text(),
	colour: text(),
	description: text(),
	templateName: text(),
	templateFields: text({ mode: 'json' }),
});

interface ContentItemDtoFields {
	name: string,
	icon: string | null,
	colour: string | null,
	description: string | null,
	templateName: string | null,
	templateFields: FieldStorage
}

export type CreateContentItemDto = BaseCreateDto & ContentItemDtoFields

export type UpdateContentItemDto = CreateContentItemDto

export type ContentItemDto = BaseEntityDto & ContentItemDtoFields

export type ContentItemVersionDto = BaseVersionDto & ContentItemDtoFields
