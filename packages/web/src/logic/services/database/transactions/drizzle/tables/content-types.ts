import {sqliteTable, text} from "drizzle-orm/sqlite-core";
import {
	entityIdentifiers,
	metadataFields,
	versionIdentifiers
} from "./common.ts";

export const contentTypesContent = {
	name: text().notNull(),
	icon: text(),
	colour: text(),
	description: text(),
	template_name: text(),
	template_fields: text({ mode: 'json' }),
}

export const contentTypes = sqliteTable('content_types', {
	...entityIdentifiers,
	...metadataFields,
	...contentTypesContent,
});

export const contentTypesVersions = sqliteTable('content_types_versions', {
	...versionIdentifiers,
	...metadataFields,
	...contentTypesContent,
});

export type DatabaseContentType = typeof contentTypes.$inferSelect
export type DatabaseContentTypeVersion = typeof contentTypesVersions.$inferSelect
