import {z} from "zod";
import {createDateField, createIdField, ProtectedDataField} from "../common/fields";

export const BaseDocumentDto = z.object({
	spec: z.string().url(),
	vaultId: createIdField("vaultId"),
	documentId: createIdField('documentId'),
	id: createIdField(),
	previousVersionId: createIdField("previousVersionId").nullable(),
	type: z.string()
		.min(1, "type must be at least 1 character.")
		.max(255, "type can't be over 255 characters."),
	createdAt: createDateField('createdAt'),
	createdBy: z.string()
		.min(1, "createdBy must be at least 1 character.")
		.max(20, "createdBy can't be over 20 characters."),
})
export type BaseDocumentDto = z.infer<typeof BaseDocumentDto>;

export const ActiveDocumentDto = BaseDocumentDto.extend({
	// Data is nullable because it will be removed once the version is deleted.
	data: ProtectedDataField,
	deletedAt: z.null(),
}).strict()
export type ActiveDocumentDto = z.infer<typeof ActiveDocumentDto>;

export const DeletedDocumentDto = BaseDocumentDto.extend({
	// Data is nullable because it will be removed once the version is deleted.
	data: z.null(),
	deletedAt: createDateField('deletedAt'),
}).strict()
export type DeletedDocumentDto = z.infer<typeof DeletedDocumentDto>;

export const DocumentDto = z.union([ActiveDocumentDto, DeletedDocumentDto]);
export type DocumentDto = z.infer<typeof DocumentDto>;
