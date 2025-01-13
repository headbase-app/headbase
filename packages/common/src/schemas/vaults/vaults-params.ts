import {z} from "zod";
import {ResourceListingParams} from "../common/listings";
import {VaultDto} from "./vaults";

export const VaultsURLParams = z.object({
  vaultId: z.string().uuid("vaultId must be a uuid"),
}).strict();
export type VaultsURLParams = z.infer<typeof VaultsURLParams>;

export const VaultsParams = ResourceListingParams
export type VaultsParams = z.infer<typeof VaultsParams>

export const VaultsQueryParams = ResourceListingParams.extend({
  ownerIds: z.array(VaultDto.shape.ownerId).optional()
}).strict()
export type VaultsQueryParams = z.infer<typeof VaultsQueryParams>;
