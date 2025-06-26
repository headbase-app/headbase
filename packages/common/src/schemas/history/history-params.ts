import {z} from "zod";
import {ResourceListingParams} from "../common/listings";
import {HistoryItemDto} from "./history";

export const HistoryURLParams = z.object({
	id: z.string().uuid("history id must be a uuid"),
}).strict();
export type HistoryURLParams = z.infer<typeof HistoryURLParams>;

export const HistoryQueryByIdsParams = z.object({
	ids: z.array(HistoryItemDto.shape.id)
}).strict()
export type HistoryQueryByIdsParams = z.infer<typeof HistoryQueryByIdsParams>;

export const HistoryQueryByFiltersParams = ResourceListingParams.extend({
	vaultId: HistoryItemDto.shape.vaultId,
	vaultIds: z.array(HistoryItemDto.shape.vaultId).optional(),
	types: z.array(HistoryItemDto.shape.type).optional(),
}).strict()
export type HistoryQueryByFiltersParams = z.infer<typeof HistoryQueryByFiltersParams>;

export const HistoryQueryParams = z.union([HistoryQueryByFiltersParams, HistoryQueryByFiltersParams])
export type HistoryQueryParams = z.infer<typeof HistoryQueryParams>;
