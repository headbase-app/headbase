import {z} from "zod";

export const VaultsURLParams = z.object({
  vaultId: z.uuid("vaultId URL param must be a uuid"),
}).strict();
export type VaultsURLParams = z.infer<typeof VaultsURLParams>;
