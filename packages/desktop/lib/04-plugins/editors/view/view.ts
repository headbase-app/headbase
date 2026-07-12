import {z} from "zod";
import {DynamicFields} from "../../../02-apis/plugin/plugins/source-plugin/dynamic-fields.ts";

export const ViewConfig = z.object({
	name: z.string(),
	sources: z.array(z.object({
		version: z.literal(1),
		type: z.url(),
		settings: DynamicFields,
		query: z.string().nullish(),
	}))
})
export type ViewConfig = z.infer<typeof ViewConfig>
