import {z} from "zod";
import {createDateField, createIdField, ProtectedDataField} from "../common/fields";

export const BaseItemDto = z.object({
	vaultId: createIdField("vaultId"),
	id: createIdField(),
	groupId: createIdField("groupId"),
	previousVersionId: createIdField("previousVersionId").nullable(),
	type: z.string()
		.min(1, "type must be at least 1 character.")
		.max(20, "type can't be over 20 characters."),
	createdBy: z.string()
		.min(1, "createdBy must be at least 1 character.")
		.max(20, "createdBy can't be over 20 characters."),
	createdAt: createDateField('createdAt'),
})
export type BaseItemDto = z.infer<typeof BaseItemDto>;

export const ActiveItemDto = BaseItemDto.extend({
	// Data is nullable because it will be removed once the version is deleted.
	protectedData: ProtectedDataField,
	deletedAt: z.null(),
}).strict()
export type ActiveItemDto = z.infer<typeof ActiveItemDto>;

export const DeletedItemDto = BaseItemDto.extend({
	// Data is nullable because it will be removed once the version is deleted.
	protectedData: z.null(),
	deletedAt: createDateField('deletedAt'),
}).strict()
export type DeletedItemDto = z.infer<typeof DeletedItemDto>;

export const ItemDto = z.union([ActiveItemDto, DeletedItemDto]);
export type ItemDto = z.infer<typeof ItemDto>;
