import {z} from "zod";
import {ResourceListingParams} from "../common/listings";
import {ItemDto} from "./items";
import {createIdField} from "../common/fields";

export const ItemsURLParams = z.object({
	itemId: z.string().uuid("itemId must be a uuid"),
}).strict();
export type ItemsURLParams = z.infer<typeof ItemsURLParams>;

export const ItemsQueryByIdsParams = z.object({
	ids: z.array(ItemDto.shape.id)
}).strict()
export type ItemsQueryByIdsParams = z.infer<typeof ItemsQueryByIdsParams>;

export const ItemsQueryByFiltersParams = ResourceListingParams.extend({
	vaultId: createIdField('vaultId'),
	types: z.array(ItemDto.shape.type).optional(),
}).strict()
export type ItemsQueryByFiltersParams = z.infer<typeof ItemsQueryByFiltersParams>;

export const ItemsQueryParams = z.union([ItemsQueryByIdsParams, ItemsQueryByFiltersParams])
export type ItemsQueryParams = z.infer<typeof ItemsQueryParams>;
