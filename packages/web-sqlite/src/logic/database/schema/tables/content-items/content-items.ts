import {sqliteTable, text} from "drizzle-orm/sqlite-core";
import {BaseCreateDto, BaseDto, commonEntityFields, commonFields, commonVersionFields} from "../../common.ts";
import {FieldStorage} from "./field-storage.ts";

export const contentItems = sqliteTable('content_items', {
	...commonFields,
	...commonEntityFields,
});

export const contentItemsVersions = sqliteTable('content_items_versions', {
	...commonFields,
	...commonVersionFields,
	name: text().notNull(),
	icon: text(),
	fields: text({ mode: 'json' }),
});

export type CreateContentItemDto = BaseCreateDto & {
	name: string,
	icon: string | null,
	fields: FieldStorage
}

export type UpdateContentItemDto = CreateContentItemDto

export type ContentItemDto = BaseDto & {
	name: string,
	icon:  string | null,
	fields: FieldStorage
}
