import {integer, sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const vaults = sqliteTable('vaults', {
	headbaseVersion: text().notNull(),
	id: text().primaryKey(),
	name: text().notNull(),
	protectedEncryptionKey: text().notNull(),
	protectedData: text(),
	ownerId: text(),
	syncEnabled: integer({ mode: 'boolean' }).notNull(),
	lastSyncedAt: text(),
	createdAt: text().notNull(),
	updatedAt: text().notNull(),
	deletedAt: text(),
});

export const schema = {vaults} as const;