import {z} from "zod";
import {FIELD_TYPES} from "../types.ts";


export const ScaleSettings = z.object({
	type: z.literal(FIELD_TYPES.scale.id),
	settings: z.object({
		minLabel: z.string()
			.min(1, "minimum label must be between 1 and 20 chars")
			.max(20, "minimum label must be between 1 and 20 chars"),
		maxLabel: z.string()
			.min(1, "max label must be between 1 and 20 chars")
			.max(20, "max label must be between 1 and 20 chars"),
		scale: z.number()
			.int()
			.min(3, "scale must be between 3 and 10")
			.max(10,  "scale must be between 3 and 10")
	})
}).strict()
export type ScaleSettings = z.infer<typeof ScaleSettings>

export const ScaleValue = z.number().min(1)
export type ScaleValue = z.infer<typeof ScaleValue>


export const PointSettings = z.object({
	type: z.literal(FIELD_TYPES.point.id),
}).strict()
export type PointSettings = z.infer<typeof PointSettings>

export const PointValue = z.object({
	x: z.number(),
	y: z.number()
})
export type PointValue = z.infer<typeof PointValue>


export const FilesSettings = z.object({
	type: z.literal(FIELD_TYPES.files.id),
}).strict()
export type FilesSettings = z.infer<typeof FilesSettings>

export const FilesValue = z.array(z.string())
export type FilesValue = z.infer<typeof FilesValue>

export const ImagesSettings = z.object({
	type: z.literal(FIELD_TYPES.images.id),
}).strict()
export type ImagesSettings = z.infer<typeof ImagesSettings>

export const ImagesValue = z.array(z.string())
export type ImagesValue = z.infer<typeof ImagesValue>
