import {z} from "zod"
import {IdField, BooleanField, TimestampField} from "./fields";

export const DatabaseFields = z.object({
	name: z
		.string()
		.min(1, "name length must be between 1 and 50 chars")
		.max(50, "name length must be between 1 and 50 chars"),
}).strict()
export type DatabaseFields = z.infer<typeof DatabaseFields>

export const DatabaseEntity = DatabaseFields.extend({
	id: IdField,
	protectedEncryptionKey: z.string(),
	protectedData: z.string().optional(),
	createdAt: TimestampField,
	updatedAt: TimestampField,
	isDeleted: BooleanField,
	headbaseVersion: z.string(),
}).strict()
export type DatabaseEntity = z.infer<typeof DatabaseEntity>

export const LocalDatabaseFields = DatabaseFields.extend({
	syncEnabled: BooleanField,
}).strict()
export type LocalDatabaseFields = z.infer<typeof LocalDatabaseFields>

export const LocalDatabaseEntity = DatabaseEntity.merge(LocalDatabaseFields).extend({
	lastSyncedAt: TimestampField.optional(),
}).strict()
export type LocalDatabaseEntity = z.infer<typeof LocalDatabaseEntity>

export const LocalDatabaseDto = LocalDatabaseEntity.extend({
	isUnlocked: z.boolean(),
}).strict()
export type LocalDatabaseDto = z.infer<typeof LocalDatabaseDto>
