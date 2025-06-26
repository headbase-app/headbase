import {z} from "zod";
import {createDateField, createIdField} from "../common/fields";

export const HistoryItemDto = z.object({
	vaultId: createIdField("vaultId"),
	id: createIdField(),
	previousVersionId: createIdField("previousVersionId").nullable(),
	createdAt: createDateField('createdAt'),
	deletedAt: createDateField('deletedAt').nullable(),
	path: z.string()
		.min(1, "path must be at least 1 character."),
	type: z.string()
		.min(1, "type must be at least 1 character.")
		.max(255, "type can't be over 255 characters."),
	device: z.string()
		.min(1, "device must be at least 1 character.")
		.max(20, "device can't be over 20 characters."),
	content: z.string().nullable(),
	contentHash: z.string().nullable(),
})
export type HistoryItemDto = z.infer<typeof HistoryItemDto>;

export const CreateHistoryItemDto = HistoryItemDto
	.pick({device: true, path: true, type: true, content: true, contentHash: true})
export type CreateHistoryItemDto = z.infer<typeof CreateHistoryItemDto>;
