import { pgTable, uuid, varchar, timestamp, pgEnum, text, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const createdAt = timestamp({ mode: "string" }).notNull();
const updatedAt = timestamp({ mode: "string" }).notNull();
const deletedAt = timestamp({ mode: "string" });

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
	verifiedAt: timestamp({ mode: "string" }),
	firstVerifiedAt: timestamp({ mode: "string" }),
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

export const vaultsRelations = relations(vaults, ({ one }) => ({
	owner: one(users, {
		fields: [vaults.ownerId],
		references: [users.id],
	}),
}));

export const files = pgTable("files", {
	vaultId: uuid().notNull(),
	versionId: uuid().primaryKey(),
	previousVersionId: uuid(),
	fileId: uuid().notNull(),
	parentFileId: uuid(),
	isDirectory: boolean().notNull(),
	fileName: varchar({ length: 255 }).notNull(),
	fileHash: text().notNull(),
	fileSize: integer().notNull(),
	createdAt,
	updatedAt,
	deletedAt,
	createdBy: varchar({ length: 100 }).notNull(),
	updatedBy: varchar({ length: 100 }).notNull(),
	deletedBy: varchar({ length: 100 }).notNull(),
	committedAt: timestamp({ mode: "string" }),
});

export const filesRelations = relations(files, ({ one }) => ({
	vault: one(vaults, {
		fields: [files.vaultId],
		references: [vaults.id],
	}),
}));

export const filesChunks = pgTable("files_chunks", {
	versionId: uuid().notNull(),
	chunkHash: text().primaryKey(),
	filePosition: integer().notNull(),
});

export const filesChunksRelations = relations(filesChunks, ({ one }) => ({
	file: one(files, {
		fields: [filesChunks.versionId],
		references: [files.versionId],
	}),
}));

export const schema = {
	settings,
	users,
	vaults,
	files,
	filesChunks,
} as const;
