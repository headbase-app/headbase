import {z} from "zod";
import {createDateField, createIdField, ProtectedDataField} from "../common/fields";

export const ItemDto = z.object({
	vaultId: createIdField("vaultId"),
	id: createIdField(),
	type: z.string()
		.min(1, "type must be at least 1 character.")
		.max(20, "type can't be over 20 characters."),
	createdAt: createDateField('createdAt'),
	deletedAt: createDateField('deletedAt').nullable(),
}).strict()
export type ItemDto = z.infer<typeof ItemDto>;
