import {z} from "zod"
import {VaultDto} from "@headbase-app/contracts";

// todo: refactor common fields out of database folder

export const LocalVaultDto = VaultDto
	.omit({
		ownerId: true,
	})
	.strict()
// syncEnabled: z.boolean(),
// lastSyncedAt: createDateField("lastSyncedAt").nullable(),
export type LocalVaultDto = z.infer<typeof LocalVaultDto>

export const CreateVaultDto = LocalVaultDto
	.pick({
		name: true
	})
	.extend({
		password: z.string().min(12, "Your password must be at least 12 characters")
	})
export type CreateVaultDto = z.infer<typeof CreateVaultDto>

export const UpdateVaultDto = CreateVaultDto.pick({name: true}).partial()
export type UpdateVaultDto = z.infer<typeof UpdateVaultDto>

export const UpdateVaultPasswordDto = z.object({
	// Don't need to validate existing password.
	password: z.string(),
	newPassword: CreateVaultDto.shape.password,
})
export type UpdateVaultPasswordDto = z.infer<typeof UpdateVaultPasswordDto>
