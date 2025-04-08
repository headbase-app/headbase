import {z} from "zod";
import {createDateField, createIdField, ProtectedDataField} from "../common/fields";

export const BaseVersionDto = z.object({
	vaultId: createIdField("vaultId"),
	spec: z.string()
		.min(1, "spec must be at least 1 character.")
		.max(255, "spec can't be over 255 characters."),
	type: z.string()
		.min(1, "type must be at least 1 character.")
		.max(255, "type can't be over 255 characters."),
	objectId: createIdField("objectId"),
	id: createIdField(),
	previousVersionId: createIdField("previousVersionId").nullable(),
	createdAt: createDateField('createdAt'),
	createdBy: z.string()
		.min(1, "createdBy must be at least 1 character.")
		.max(20, "createdBy can't be over 20 characters."),
})
export type BaseVersionDto = z.infer<typeof BaseVersionDto>;

export const ActiveVersionDto = BaseVersionDto.extend({
	// Data is nullable because it will be removed once the version is deleted.
	protectedData: ProtectedDataField,
	deletedAt: z.null(),
}).strict()
export type ActiveVersionDto = z.infer<typeof ActiveVersionDto>;

export const DeletedVersionDto = BaseVersionDto.extend({
	// Data is nullable because it will be removed once the version is deleted.
	protectedData: z.null(),
	deletedAt: createDateField('deletedAt'),
}).strict()
export type DeletedVersionDto = z.infer<typeof DeletedVersionDto>;

export const VersionDto = z.union([ActiveVersionDto, DeletedVersionDto]);
export type VersionDto = z.infer<typeof VersionDto>;
