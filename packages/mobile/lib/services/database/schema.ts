import {sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const vaults = sqliteTable('vaults', {
	id: text().primaryKey().notNull(),
	path: text().notNull(),
	displayName: text().notNull(),
	createdAt: text().notNull(),
	updatedAt: text().notNull(),
});

export const schema = {vaults} as const;
