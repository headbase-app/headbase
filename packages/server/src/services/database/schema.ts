import {pgTable, uuid, varchar, timestamp, pgEnum, text, boolean} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";

const timestampField = timestamp({mode: "string"}).notNull()

export const settings = pgTable("settings", {
	id: uuid().primaryKey(),
	registrationEnabled: boolean().notNull(),
	createdAt: timestampField,
});


export const rolesEnum = pgEnum("user_roles", ["user", "admin"]);

export const users = pgTable("users", {
	id: uuid().primaryKey(),
	email: varchar({ length: 100 }).notNull().unique("email_unique"),
	displayName: varchar({ length: 50 }).notNull(),
	passwordHash: varchar({ length: 100 }).notNull(),
	verifiedAt: timestamp().notNull(),
	firstVerifiedAt: timestamp().notNull(),
	role: rolesEnum(),
	createdAt: timestampField,
	updatedAt: timestampField,
});

export const usersRelations = relations(users, ({ many }) => ({
	vaults: many(vaults),
}));


export const vaults = pgTable("vaults", {
	ownerId: uuid().notNull(),
	id: uuid().primaryKey(),
	name: varchar({ length: 100 }).notNull().unique("vault_name_unique"),
	protectedEncryptionKey: varchar({ length: 500 }).notNull(),
	protectedData: text(),
	createdAt: timestampField,
	updatedAt: timestampField,
	deletedAt: timestampField,
});

export const vaultsRelations = relations(vaults, ({ one, many }) => ({
	owner: one(users, {
		fields: [vaults.ownerId],
		references: [users.id],
	}),
	items: many(items)
}));

export const items = pgTable("items", {
	vaultId: uuid().notNull(),
	id: uuid().primaryKey(),
	groupId: uuid().notNull(),
	previousVersionId: uuid().notNull(),
	type: varchar({ length: 20 }).notNull(),
	protectedData: text(),
	createdBy: varchar({ length: 50 }).notNull(),
	createdAt: timestampField,
	deletedAt: timestampField,
});

export const itemsRelations = relations(items, ({ one }) => ({
	vault: one(vaults, {
		fields: [items.vaultId],
		references: [vaults.id],
	}),
}));
