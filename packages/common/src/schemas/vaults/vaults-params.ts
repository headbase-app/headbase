import {z} from "zod";
import {ResourceListingParams} from "../common/listings";

export const VaultsURLParams = z.object({
  vaultId: z.string().uuid("vaultId must be a uuid"),
}).strict();
export type VaultsURLParams = z.infer<typeof VaultsURLParams>;

export const VaultsParams = ResourceListingParams
export type VaultsParams = z.infer<typeof VaultsParams>
