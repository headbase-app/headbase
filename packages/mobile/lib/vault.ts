import {z} from "zod"

export const VaultDto = z.object({
	id: z.uuid("id must be a uuid"),
	displayName: z.string()
		.min(1, "displayName must be between 1 and 100 characters")
		.max(100, "displayName must be between 1 and 100 characters"),
	path: z.string()
		.min(1, "path must be supplied"),
	createdAt: z.iso.datetime('createdAt must be an ISO 8601 formatted datetime with no timezone'),
	updatedAt: z.iso.datetime('updatedAt must be an ISO 8601 formatted datetime with no timezone'),
}).strict()
export type VaultDto = z.infer<typeof VaultDto>;

export const CreateVaultDto = VaultDto
	.pick({
		displayName: true,
		path: true
	})
	.strict()
export type CreateVaultDto = z.infer<typeof CreateVaultDto>

export const UpdateVaultDto = VaultDto
	.pick({
		displayName: true,
		path: true
	})
	.strict()
export type UpdateVaultDto = z.infer<typeof UpdateVaultDto>

export const VaultList = z.array(VaultDto)
export type VaultList = z.infer<typeof VaultList>
