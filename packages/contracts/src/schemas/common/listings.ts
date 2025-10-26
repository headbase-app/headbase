import {z} from "zod";

// todo: update to match listing format: https://github.com/headbase-app/headbase/blob/main/docs/development/server/listing-params.md
export const ResourceListingParams = z.object({
	limit: z.number().int()
		.min(1, "limit param must be at least 1")
		.optional(),
	offset: z.number().int()
		.min(1, "offset param must be at least 1")
		.optional(),
		// maximum limit values are set by the server itself, so can't be shared validation.
}).strict();
export type ResourceListingParams = z.infer<typeof ResourceListingParams>;

export interface ResourceListingResult<T> {
	meta: {
		results: number
		total: number
		limit: number
		offset: number
	}
	results: T[]
}
