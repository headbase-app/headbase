import {int, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {commonEntityFields, commonFields, commonVersionFields} from "../common/database.ts";

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
