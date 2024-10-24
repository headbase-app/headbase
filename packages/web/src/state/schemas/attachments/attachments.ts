import {z} from "zod";

export const AttachmentData = z.object({
	filename: z.string(),
	mimeType: z.string(),
	size: z.number(),
	data: z.string()
}).strict()
export type AttachmentData = z.infer<typeof AttachmentData>
