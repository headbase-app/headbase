import {sqliteTable, text} from "drizzle-orm/sqlite-core";

export const objects = sqliteTable('objects', {
	spec: text().notNull(),
	type: text().notNull(),
	id: text().notNull().primaryKey(),
	version_id: text().notNull(),
	previous_version_id: text(),
	created_at: text().notNull(),
	created_by: text().notNull(),
	updated_at: text().notNull(),
	updated_by: text().notNull(),
	data: text({ mode: 'json' }),
});

export const objectVersions = sqliteTable('object_versions', {
	spec: text().notNull(),
	type: text().notNull(),
	object_id: text().notNull().primaryKey(),
	id: text().notNull(),
	previous_version_id: text(),
	created_at: text().notNull(),
	created_by: text().notNull(),
	deleted_at: text(),
	data: text({ mode: 'json' }),
});

export type DrizzleDataObject = typeof objects.$inferSelect
export type DrizzleDataVersion = typeof objectVersions.$inferSelect
