import {pgTable, uuid, varchar, timestamp, pgEnum, text, boolean} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";

const createdAt = timestamp({mode: "string"}).notNull()
const updatedAt = timestamp({mode: "string"}).notNull()
const deletedAt = timestamp({mode: "string"})

export const settings = pgTable("settings", {
	id: uuid().primaryKey().defaultRandom(),
	registrationEnabled: boolean().notNull(),
	createdAt: createdAt.defaultNow(),
});


export const rolesEnum = pgEnum("user_roles", ["user", "admin"]);

export const users = pgTable("users", {
	id: uuid().primaryKey().defaultRandom(),
	email: varchar({ length: 100 }).notNull().unique("email_unique"),
	displayName: varchar({ length: 50 }).notNull(),
	passwordHash: varchar({ length: 100 }).notNull(),
	verifiedAt: timestamp(),
	firstVerifiedAt: timestamp(),
	role: rolesEnum().default("user"),
	createdAt: createdAt.defaultNow(),
	updatedAt: updatedAt.defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
	vaults: many(vaults),
}));

export type DatabaseUserDto = typeof users.$inferSelect;
export type CreateDatabaseUserDto = typeof users.$inferInsert;

export const vaults = pgTable("vaults", {
	ownerId: uuid().notNull(),
	id: uuid().primaryKey(),
	name: varchar({ length: 100 }).notNull().unique("vault_name_unique"),
	protectedEncryptionKey: varchar({ length: 500 }).notNull(),
	protectedData: text(),
	createdAt,
	updatedAt,
	deletedAt,
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
	previousVersionId: uuid(),
	type: varchar({ length: 20 }).notNull(),
	protectedData: text(),
	createdBy: varchar({ length: 50 }).notNull(),
	createdAt,
	deletedAt,
});

export const itemsRelations = relations(items, ({ one }) => ({
	vault: one(vaults, {
		fields: [items.vaultId],
		references: [vaults.id],
	}),
}));

export const schema = {
	settings, users, vaults, items
} as const;
