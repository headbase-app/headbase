import {z} from "zod";
import {ResourceListingParams} from "../common/listings";
import {ActiveDocumentDto} from "./document";

export const DocumentURLParams = z.object({
	id: z.string().uuid("document id must be a uuid"),
}).strict();
export type DocumentURLParams = z.infer<typeof DocumentURLParams>;

export const DocumentQueryByIdsParams = z.object({
	ids: z.array(ActiveDocumentDto.shape.id)
}).strict()
export type DocumentQueryByIdsParams = z.infer<typeof DocumentQueryByIdsParams>;

export const DocumentQueryByFiltersParams = ResourceListingParams.extend({
	vaultId: ActiveDocumentDto.shape.vaultId,
	vaultIds: z.array(ActiveDocumentDto.shape.vaultId).optional(),
	types: z.array(ActiveDocumentDto.shape.type).optional(),
}).strict()
export type DocumentQueryByFiltersParams = z.infer<typeof DocumentQueryByFiltersParams>;

export const DocumentQueryParams = z.union([DocumentQueryByFiltersParams, DocumentQueryByFiltersParams])
export type DocumentQueryParams = z.infer<typeof DocumentQueryParams>;
