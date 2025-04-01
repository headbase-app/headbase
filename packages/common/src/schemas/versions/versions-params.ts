import {z} from "zod";
import {ResourceListingParams} from "../common/listings";
import {BaseVersionDto} from "./versions";

export const VersionsURLParams = z.object({
	itemId: z.string().uuid("itemId must be a uuid"),
}).strict();
export type VersionsURLParams = z.infer<typeof VersionsURLParams>;

export const VersionsQueryByIdsParams = z.object({
	ids: z.array(BaseVersionDto.shape.id)
}).strict()
export type VersionsQueryByIdsParams = z.infer<typeof VersionsQueryByIdsParams>;

export const VersionsQueryByFiltersParams = ResourceListingParams.extend({
	vaultId: BaseVersionDto.shape.vaultId,
	objectIds: z.array(BaseVersionDto.shape.objectId).optional(),
	types: z.array(BaseVersionDto.shape.type).optional(),
}).strict()
export type VersionsQueryByFiltersParams = z.infer<typeof VersionsQueryByFiltersParams>;

export const VersionsQueryParams = z.union([VersionsQueryByIdsParams, VersionsQueryByFiltersParams])
export type VersionsQueryParams = z.infer<typeof VersionsQueryParams>;
