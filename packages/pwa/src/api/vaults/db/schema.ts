import {sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const vaults = sqliteTable('vaults', {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	protectedEncryptionKey: text().notNull(),
	protectedData: text(),
	createdAt: text().notNull(),
	updatedAt: text().notNull(),
	deletedAt: text(),
});

export const schema = {vaults} as const;
