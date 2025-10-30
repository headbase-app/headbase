import {z} from "zod";

// todo: update to match listing format: https://github.com/headbase-app/headbase/blob/main/docs/development/server/listing-params.md
export const ResourceListingParams = z.object({
	limit: z.number().int()
		.min(10, "limit param must be between 10 and 1000")
		.max(1000, "limit param must be between 10 and 1000")
		.optional(),
	offset: z.number().int()
		.min(0, "offset param must greater than 0")
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
