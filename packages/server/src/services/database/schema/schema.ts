import { pgTable, uuid, boolean, timestamp, varchar, foreignKey, text, integer, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/relations";

export const userRoles = pgEnum("user_roles", ["user", "admin"]);

export const settings = pgTable("settings", {
	id: uuid()
		.primaryKey()
		.default(sql`uuid_generate_v4()`),
	registrationEnabled: boolean("registration_enabled").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: uuid()
		.primaryKey()
		.default(sql`uuid_generate_v4()`),
	email: varchar({ length: 100 }).notNull(),
	displayName: varchar("display_name", { length: 50 }).notNull(),
	passwordHash: varchar("password_hash", { length: 100 }).notNull(),
	verifiedAt: timestamp("verified_at", { withTimezone: true, mode: "string" }),
	firstVerifiedAt: timestamp("first_verified_at", { withTimezone: true, mode: "string" }),
	role: userRoles().default("user").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	vaults: many(vaults),
}));

export const sessions = pgTable(
	"sessions",
	{
		token: varchar({ length: 64 }).primaryKey(),
		id: uuid()
			.notNull()
			.default(sql`uuid_generate_v4()`),
		userId: uuid("user_id").notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user",
		}).onDelete("cascade"),
	],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const vaults = pgTable(
	"vaults",
	{
		ownerId: uuid("owner_id").notNull(),
		id: uuid().primaryKey(),
		name: varchar({ length: 100 }).notNull(),
		protectedEncryptionKey: varchar("protected_encryption_key", { length: 500 }).notNull(),
		protectedData: text("protected_data"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
	},
	(table) => [
		foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "vault_owner",
		}).onDelete("cascade"),
	],
);

export const vaultsRelations = relations(vaults, ({ one, many }) => ({
	user: one(users, {
		fields: [vaults.ownerId],
		references: [users.id],
	}),
	files: many(files),
}));

export const files = pgTable(
	"files",
	{
		vaultId: uuid("vault_id").notNull(),
		versionId: uuid("version_id").primaryKey(),
		previousVersionId: uuid("previous_version_id"),
		fileId: uuid("file_id").notNull(),
		parentFileId: uuid("parent_file_id"),
		isDirectory: boolean("is_directory").notNull(),
		fileName: varchar("file_name", { length: 255 }).notNull(),
		fileHash: text("file_hash").notNull(),
		fileSize: integer("file_size").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
		createdBy: varchar("created_by", { length: 100 }).notNull(),
		updatedBy: varchar("updated_by", { length: 100 }).notNull(),
		deletedBy: varchar("deleted_by", { length: 100 }),
		committedAt: timestamp("committed_at", { withTimezone: true, mode: "string" }),
	},
	(table) => [
		foreignKey({
			columns: [table.vaultId],
			foreignColumns: [vaults.id],
			name: "files_vault",
		}).onDelete("cascade"),
	],
);

export const filesRelations = relations(files, ({ one, many }) => ({
	vault: one(vaults, {
		fields: [files.vaultId],
		references: [vaults.id],
	}),
	filesChunks: many(filesChunks),
}));

export const filesChunks = pgTable(
	"files_chunks",
	{
		versionId: uuid("version_id").notNull(),
		chunkHash: text("chunk_hash").primaryKey(),
		filePosition: integer("file_position").notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.versionId],
			foreignColumns: [files.versionId],
			name: "files_chunks_file",
		}).onDelete("cascade"),
	],
);

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
