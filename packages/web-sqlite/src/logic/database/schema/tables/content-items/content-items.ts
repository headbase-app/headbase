import {int, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {BaseCreateDto, BaseEntityDto, BaseVersionDto, commonEntityFields, commonFields, commonVersionFields} from "../../common.ts";
import {FieldStorage} from "../fields/field-storage.ts";

export const contentItems = sqliteTable('content_items', {
	...commonFields,
	...commonEntityFields,
});

export const contentItemsVersions = sqliteTable('content_items_versions', {
	...commonFields,
	...commonVersionFields,
	type: text().notNull(),
	name: text().notNull(),
	isFavorite: int({mode: 'boolean'}).notNull(),
	fields: text({ mode: 'json' }),
});

interface ContentItemDtoFields {
	type: string,
	name: string,
	isFavorite: boolean,
	fields: FieldStorage
}

export type CreateContentItemDto = BaseCreateDto & ContentItemDtoFields
export type UpdateContentItemDto = CreateContentItemDto

export type ContentItemDto = BaseEntityDto & ContentItemDtoFields

export type ContentItemVersionDto = BaseVersionDto & ContentItemDtoFields
