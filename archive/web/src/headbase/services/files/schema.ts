import {integer, sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const filesHistory = sqliteTable('files_history', {
	// Version Identifiers
	id: text().notNull().primaryKey(),
	previousVersionId: text(),
	// File Identifiers
	fileId: text().notNull(),
	parentId: text(),
	originalPath: text().notNull(),
	isDirectory: integer({mode: 'boolean'}).notNull(),
	// Data
	type: text().notNull(),
	name: text().notNull(),
	contentHash: text().notNull(),
	// Metadata
	createdAt: text().notNull(),
	createdBy: text().notNull(),
	deletedAt: text()
});

export const schema = {filesHistory} as const;

export type LocalFileVersion = typeof filesHistory.$inferSelect;
