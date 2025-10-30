import { relations } from "drizzle-orm/relations";
import { users, vaults, files, filesChunks } from "./schema";

export const vaultsRelations = relations(vaults, ({ one, many }) => ({
	user: one(users, {
		fields: [vaults.ownerId],
		references: [users.id],
	}),
	files: many(files),
}));

export const usersRelations = relations(users, ({ many }) => ({
	vaults: many(vaults),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
	vault: one(vaults, {
		fields: [files.vaultId],
		references: [vaults.id],
	}),
	filesChunks: many(filesChunks),
}));

export const filesChunksRelations = relations(filesChunks, ({ one }) => ({
	file: one(files, {
		fields: [filesChunks.versionId],
		references: [files.versionId],
	}),
}));
