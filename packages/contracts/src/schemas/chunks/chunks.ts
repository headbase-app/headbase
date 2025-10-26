import {z} from "zod";
import {createIdField} from "../common/fields";

export const ChunkDto = z.object({
	vaultId: createIdField("vaultId"),
	hash: z.string()
		.min(1, "hash must be at least 1 character"),
	size: z.number()
		.int()
		.min(1, "fileSize must be greater than 1"),
	isStored: z.boolean(),
})
export type ChunkDto = z.infer<typeof ChunkDto>;

export const ChunkTransferDto = z.object({
	url: z.string().url()
})
export type ChunkTransferDto = z.infer<typeof ChunkTransferDto>;
