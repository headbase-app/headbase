import {z} from "zod";
import {ResourceListingParams} from "../common/listings";
import {FileDto} from "./files";

export const FilesURLParams = z.object({
	fileId: z.string().uuid("fileId must be a uuid"),
}).strict();
export type FilesURLParams = z.infer<typeof FilesURLParams>;

export const FilesQueryParams = ResourceListingParams.extend({
	vaultIds: z.array(FileDto.shape.vaultId).optional(),
	fileIds: z.array(FileDto.shape.fileId).optional(),
}).strict()
export type FilesQueryParams = z.infer<typeof FilesQueryParams>;
