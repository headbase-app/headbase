import {z} from "zod";
import {ChunkDto} from "./chunks";

export const ChunksURLParams = z.object({
	hash: ChunkDto.shape.hash
}).strict();
export type ChunksURLParams = z.infer<typeof ChunksURLParams>;
