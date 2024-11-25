import {customType, int, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {commonEntityFields, commonFields, commonVersionFields} from "../common/database.ts";
import {ViewTypes} from "./types.ts";

export const views = sqliteTable('views', {
	...commonFields,
	...commonEntityFields,
});

export const viewTypeColumn = customType<{data: ViewTypes}>(({
	dataType() {
		return 'text'
	}
}))

export const viewsVersions = sqliteTable('views_versions', {
	...commonFields,
	...commonVersionFields,
	type: viewTypeColumn().notNull(),
	name: text().notNull(),
	icon: text(),
	colour: text(),
	description: text(),
	isFavorite: int({mode: 'boolean'}).notNull(),
	settings: text({ mode: 'json' }),
});
