import {sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const documents = sqliteTable('documents', {
	// Specification
	spec: text().notNull(),
	// Identifiers
	type: text().notNull(),
	id: text().notNull().primaryKey(),
	versionId: text().notNull(),
	previousVersionId: text(),
	// Metadata
	createdAt: text().notNull(),
	createdBy: text().notNull(),
	updatedAt: text().notNull(),
	updatedBy: text().notNull(),
	deletedAt: text(),
	// Data
	data: text({ mode: 'json' }),
});

export const documentsHistory = sqliteTable('documents_history', {
	// Specification
	spec: text().notNull(),
	// Identifiers
	type: text().notNull(),
	documentId: text().notNull(),
	id: text().notNull().primaryKey(),
	previousVersionId: text(),
	// Metadata
	createdAt: text().notNull(),
	createdBy: text().notNull(),
	deletedAt: text(),
	// Data
	data: text({ mode: 'json' }),
});

export const schema = {documents, documentsHistory} as const;
