import {customType, text} from "drizzle-orm/sqlite-core";

export const booleanColumn = customType<{data: 0 | 1}>(({
	dataType() {
		return 'int'
	}
}))


export const entityIdentifiers = {
	id: text().notNull().primaryKey(),
	version_id: text().notNull(),
	previous_version_id: text()
}

export const versionIdentifiers = {
	entity_id: text().notNull(),
	id: text().notNull().primaryKey(),
	previous_version_id: text()
}

export const metadataFields = {
	created_at: text().notNull(),
	created_by: text().notNull(),
	updated_at: text().notNull(),
	updated_by: text().notNull(),
	is_deleted: booleanColumn().notNull(),
	hbv: text().notNull(),
}
