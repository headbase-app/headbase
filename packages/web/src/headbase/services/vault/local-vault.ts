import {z} from "zod"
import {VaultDto} from "@headbase-app/common";

export const TimestampField = z.string().datetime('timestamp field must be in iso format')
export type TimestampField = z.infer<typeof TimestampField>

// todo: refactor common fields out of database folder

export const LocalVaultEntity = VaultDto
	.omit({
		ownerId: true,
		// todo: remove once removed from common types
		deletedAt: true
	})
	.extend({
		syncEnabled: z.boolean(),
		lastSyncedAt: TimestampField.nullish(),
		// Not used right now, but will help allow for migrations in future if required.
		headbaseVersion: z.string(),
	}).strict()
export type LocalVaultEntity = z.infer<typeof LocalVaultEntity>

// isUnlocked is determined based on a key existing in app storage and isn't stored as an attribute of the database itself.
export const LocalVaultDto = LocalVaultEntity
	.extend({
		isUnlocked: z.boolean(),
	}).strict()
export type LocalVaultDto = z.infer<typeof LocalVaultDto>

export const CreateVaultDto = LocalVaultDto
	.pick({
		name: true,
		syncEnabled: true
	})
	.extend({
		password: z.string().min(8, "password must be at least 8 characters")
	})
export type CreateVaultDto = z.infer<typeof CreateVaultDto>

export const UpdateVaultDto = LocalVaultDto
	.pick({
		name: true,
		syncEnabled: true,
		lastSyncedAt: true
	})
	.partial()
export type UpdateVaultDto = z.infer<typeof UpdateVaultDto>
