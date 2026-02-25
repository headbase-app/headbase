import {z} from "zod";

export const VaultDto = z.object({
	id: z.uuid("vault id must be a uuid"),
	displayName: z.string()
		.min(1, "displayName must be between 1 and 100 characters")
		.max(100, "displayName must be between 1 and 100 characters"),
	// todo: should there be a max length at all?
	protectedEncryptionKey: z.string()
		.min(1, "protectedEncryptionKey must be between 1 and 500 characters")
		.max(500, "protectedEncryptionKey must be between 1 and 500 characters"),
	protectedData: z.string().nullable(),
	createdAt: z.iso.datetime('createdAt must be an ISO 8601 formatted datetime with no timezone'),
	updatedAt: z.iso.datetime('updatedAt must be an ISO 8601 formatted datetime with no timezone'),
	deletedAt: z.iso
		.datetime('deletedAt must be an ISO 8601 formatted datetime with no timezone')
		.nullable(),
}).strict()
export type VaultDto = z.infer<typeof VaultDto>;

export const UpdateVaultDto = VaultDto
	.pick({displayName: true, protectedEncryptionKey: true, protectedData: true})
	.partial();
export type UpdateVaultDto = z.infer<typeof UpdateVaultDto>;

export const SyncVaultDto = VaultDto
	.pick({displayName: true, protectedEncryptionKey: true, protectedData: true, updatedAt: true})
export type SyncVaultDto = z.infer<typeof SyncVaultDto>;
