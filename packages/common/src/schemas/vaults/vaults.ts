import {z} from "zod";
import {createIdField, ProtectedDataField, createDateField} from "../common/fields";

export const VaultFields = z.object({
	name: z.string()
		.min(1, "name must be at least 1 character.")
		.max(100, "name can't be over 100 characters."),
	protectedEncryptionKey: z.string()
		.min(1, "protectedEncryptionKey must be at least 1 character.")
		.max(255, "protectedEncryptionKey can't be over 255 characters."),
	protectedData: ProtectedDataField.nullish(),
	ownerId: createIdField('ownerId'),
}).strict()
export type VaultFields = z.infer<typeof VaultFields>;

export const VaultEntity = VaultFields.extend({
	id: createIdField(),
	createdAt: createDateField('createdAt'),
	updatedAt: createDateField('updatedAt'),
	deletedAt: createDateField('deletedAt').nullable(),
}).strict()
export type VaultEntity = z.infer<typeof VaultEntity>;

export const VaultDto = VaultEntity;
export type VaultDto = z.infer<typeof VaultDto>;

export const CreateVaultDto = VaultEntity;
export type CreateVaultDto = VaultEntity;

export const UpdateVaultDto = VaultFields
	.pick({name: true, protectedEncryptionKey: true, protectedData: true})
	.partial();
export type UpdateVaultDto = z.infer<typeof UpdateVaultDto>;
