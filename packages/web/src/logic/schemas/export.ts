import {z} from "zod";

export const DatabaseExport = z.object({
	spec: z.string(),
	createdAt: z.string().datetime(),
	data: z.array(z.object({}))
})

export type DatabaseExport = z.infer<typeof DatabaseExport>