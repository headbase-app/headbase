import {z} from "zod";
import {createDateField, createIdField} from "../common/fields";
import {ChunkDto} from "../chunks/chunks";

export const FileDto = z.object({
	vaultId: createIdField("vaultId"),
	versionId: createIdField(),
	previousVersionId: createIdField("previousId").nullable(),
	fileId: createIdField("fileId"),
	parentFileId: createIdField("parentFileId").nullable(),
	isDirectory: z.boolean(),
	fileName: z.string()
		.min(1, "fileName must be at least 1 character"),
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
		.max(20, "deletedBy can't be over 20 characters.")
		.nullable(),
	committedAt: createDateField('committedAt').nullable(),
})
	.strict()
export type FileDto = z.infer<typeof FileDto>;

export const FileChunkDto = z.object({
	versionId: FileDto.shape.versionId,
	chunkHash: ChunkDto.shape.hash,
	filePosition: z.number().int()
		.min(0, "filePosition must be 0 or higher"),
})
export type FileChunkDto = z.infer<typeof FileChunkDto>;

export const CreateFileChunkDto = FileChunkDto.omit({versionId: true})
export type CreateFileChunkDto = z.infer<typeof CreateFileChunkDto>;

export const CreateFileDto = FileDto.extend({
	chunks: z.array(CreateFileChunkDto)
});
export type CreateFileDto = z.infer<typeof CreateFileDto>;
