import {z} from "zod"
import {VaultDto} from "@headbase-app/common";
import {TimestampField} from "./common/fields.ts";

// todo: refactor common fields out of database folder

export const LocalDatabaseEntity = VaultDto
	.omit({
		ownerId: true,
		// todo: remove once removed from common types
		deletedAt: true
	})
	.extend({
		syncEnabled: z.boolean(),
		lastSyncedAt: TimestampField.optional(),
		// Not used right now, but will help allow for migrations in future if required.
		headbaseVersion: z.string(),
	}).strict()
export type LocalDatabaseEntity = z.infer<typeof LocalDatabaseEntity>

// isUnlocked is determined based on a key existing in app storage and isn't stored as an attribute of the database itself.
export const LocalDatabaseDto = LocalDatabaseEntity
	.extend({
		isUnlocked: z.boolean(),
	}).strict()
export type LocalDatabaseDto = z.infer<typeof LocalDatabaseDto>

export const CreateDatabaseDto = LocalDatabaseDto
	.pick({
		name: true,
		syncEnabled: true
	})
	.extend({
		password: z.string().min(8, "password must be at least 8 characters")
	})
export type CreateDatabaseDto = z.infer<typeof CreateDatabaseDto>

export const UpdateDatabaseDto = LocalDatabaseDto
	.pick({
		name: true,
		syncEnabled: true
	})
	.partial()
export type UpdateDatabaseDto = z.infer<typeof UpdateDatabaseDto>
