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
	description: text(),
	fields: text({ mode: 'json' }),
	colourVariant: text(),
	templateName: text(),
	templateTags: text(),
});

export type CreateContentItemDto = BaseCreateDto & {
	name: string,
	icon: string | null,
	fields: FieldStorage
}

export type UpdateContentItemDto = CreateContentItemDto

export type ContentItemDto = BaseEntityDto & {
	name: string,
	icon:  string | null,
	fields: FieldStorage
}

export type ContentItemVersionDto = BaseVersionDto & {
	name: string,
	icon:  string | null,
	fields: FieldStorage
}
