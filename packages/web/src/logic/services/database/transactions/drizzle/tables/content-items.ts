import {sqliteTable, text} from "drizzle-orm/sqlite-core";
import {entityIdentifiers, versionIdentifiers, metadataFields, booleanColumn} from "./common.ts";

export const contentItemsContent = {
	type: text().notNull(),
	name: text().notNull(),
	is_favourite: booleanColumn().notNull(),
	fields: text({ mode: 'json' }),
}

export const contentItems = sqliteTable('content_items', {
	...entityIdentifiers,
	...metadataFields,
	...contentItemsContent,
});

export const contentItemsVersions = sqliteTable('content_items_versions', {
	...versionIdentifiers,
	...metadataFields,
	...contentItemsContent,
});

export type DatabaseContentItem = typeof contentItems.$inferSelect
export type DatabaseContentItemVersion = typeof contentItemsVersions.$inferSelect
