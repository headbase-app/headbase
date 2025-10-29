import {z} from "zod";
import {ChunkDto} from "./chunks";
import {VaultDto} from "../vaults/vaults";

export const ChunksURLParams = z.object({
	vaultId: VaultDto.shape.id,
	hash: ChunkDto.shape.hash
}).strict();
export type ChunksURLParams = z.infer<typeof ChunksURLParams>;
