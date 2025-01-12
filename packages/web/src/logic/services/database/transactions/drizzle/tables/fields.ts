import {customType, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {
	entityIdentifiers,
	metadataFields,
	versionIdentifiers
} from "./common.ts";
import {FieldTypes} from "../../../../../schemas/fields/types.ts";

export const fieldsTypeColumn = customType<{data: FieldTypes}>(({
	dataType() {
		return 'text'
	}
}))

export const fieldsContent = {
	type: fieldsTypeColumn().notNull(),
	name: text().notNull(),
	description: text(),
	icon: text(),
	settings: text({ mode: 'json' }),
}

export const fields = sqliteTable('fields', {
	...entityIdentifiers,
	...metadataFields,
	...fieldsContent,
});

export const fieldsVersions = sqliteTable('fields_versions', {
	...versionIdentifiers,
	...metadataFields,
	...fieldsContent,
});

export type DatabaseField = typeof fields.$inferSelect
export type DatabaseFieldVersion = typeof fieldsVersions.$inferSelect
