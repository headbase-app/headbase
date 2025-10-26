import {z} from "zod";
import {createDateField, createIdField} from "../common/fields";
import {ChunkDto} from "../chunks/chunks";

export const FileDto = z.object({
	vaultId: createIdField("vaultId"),
	id: createIdField(),
	previousId: createIdField("previousId").nullable(),
	fileId: createIdField("fileId"),
	parentFileId: createIdField("parentFileId").nullable(),
	name: z.string()
		.min(1, "name must be at least 1 character"),
	isDirectory: z.boolean(),
	fileHash: z.string()
		.min(1, "fileHash must be at least 1 character"),
	fileSize: z.number()
		.int()
		.min(1, "fileSize must be greater than 1"),
	createdAt: createDateField('createdAt'),
	updatedAt: createDateField('updatedAt'),
	deletedAt: createDateField('deletedAt').nullable(),
	createdBy: z.string()
		.min(1, "createdBy must be at least 1 character.")
		.max(20, "createdBy can't be over 20 characters."),
	updatedBy: z.string()
		.min(1, "updatedBy must be at least 1 character.")
		.max(20, "updatedBy can't be over 20 characters."),
	deletedBy: z.string()
		.min(1, "deletedBy must be at least 1 character.")
		.max(20, "deletedBy can't be over 20 characters."),
})
	.strict()
export type FileDto = z.infer<typeof FileDto>;

export const CreateFileDto = FileDto.extend({
	chunks: z.array(ChunkDto)
});
export type CreateFileDto = z.infer<typeof CreateFileDto>;
