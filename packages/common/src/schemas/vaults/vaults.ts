import {z} from "zod";
import {createIdField, createDateField, ProtectedDataField} from "../common/fields";

export const VaultDto = z.object({
	id: createIdField(),
	createdAt: createDateField('createdAt'),
	updatedAt: createDateField('updatedAt'),
	deletedAt: createDateField('deletedAt').nullable(),
	name: z.string()
		.min(1, "name must be at least 1 character.")
		.max(100, "name can't be over 100 characters."),
	encryptionKey: z.string()
		.min(1, "protectedEncryptionKey must be at least 1 character.")
		.max(500, "protectedEncryptionKey can't be over 500 characters."), // todo: should there be a max length at all?
	protectedData: ProtectedDataField.nullable(),
	ownerId: createIdField('ownerId'),
}).strict()
export type VaultDto = z.infer<typeof VaultDto>;

export const CreateVaultDto = VaultDto
	.pick({name: true, encryptionKey: true, protectedData: true})
	.partial();
export type CreateVaultDto = z.infer<typeof CreateVaultDto>;

export const UpdateVaultDto = VaultDto
	.pick({name: true, encryptionKey: true, protectedData: true})
	.partial();
export type UpdateVaultDto = z.infer<typeof UpdateVaultDto>;
