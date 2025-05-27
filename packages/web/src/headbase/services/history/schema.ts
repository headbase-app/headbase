import {sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const history = sqliteTable('history', {
	id: text().primaryKey(),
	previousVersionId: text(),
	createdAt: text().notNull(),
	deletedAt: text(),
	device: text().notNull(),
	path: text().notNull(),
	type: text().notNull(),
	content: text(),
	contentHash: text(),
});

export const schema = {history} as const;
