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
	verifiedAt: timestamp({mode: "string"}),
	firstVerifiedAt: timestamp({mode: "string"}),
	role: rolesEnum().default("user").notNull(),
	createdAt: createdAt.defaultNow(),
	updatedAt: updatedAt.defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
	vaults: many(vaults),
}));

export type DatabaseUserDto = typeof users.$inferSelect;

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
	versions: many(versions)
}));

export const versions = pgTable("versions", {
	vaultId: uuid().notNull(),
	spec: varchar({ length: 100 }).notNull(),
	type: varchar({ length: 20 }).notNull(),
	objectId: uuid().notNull(),
	id: uuid().primaryKey(),
	previousVersionId: uuid(),
	createdAt,
	createdBy: varchar({ length: 50 }).notNull(),
	protectedData: text(),
	deletedAt,
});

export const versionsRelations = relations(versions, ({ one }) => ({
	vault: one(vaults, {
		fields: [versions.vaultId],
		references: [vaults.id],
	}),
}));

export const schema = {
	settings, users, vaults, versions
} as const;
