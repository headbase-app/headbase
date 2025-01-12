import {customType, int, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {
	booleanColumn,
	entityIdentifiers,
	metadataFields,
	versionIdentifiers
} from "./common.ts";
import {ViewTypes} from "../../../../../schemas/views/types.ts";

export const viewsTypeColumn = customType<{data: ViewTypes}>(({
	dataType() {
		return 'text'
	}
}))

export const viewsContent = {
	type: viewsTypeColumn().notNull(),
	name: text().notNull(),
	icon: text(),
	colour: text(),
	description: text(),
	is_favourite: booleanColumn().notNull(),
	settings: text({ mode: 'json' }),
}

export const views = sqliteTable('views', {
	...entityIdentifiers,
	...metadataFields,
	...viewsContent,
});

export const viewsVersions = sqliteTable('views_versions', {
	...versionIdentifiers,
	...metadataFields,
	...viewsContent,
});

export type DatabaseView = typeof views.$inferSelect
export type DatabaseViewVersion = typeof viewsVersions.$inferSelect
