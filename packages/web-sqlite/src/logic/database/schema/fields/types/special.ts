import {z} from "zod";
import {FIELDS} from "../types.ts";
import {BaseFieldData} from "../dtos.ts";


export const ScaleFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.scale.id),
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
export type ScaleFieldData = z.infer<typeof ScaleFieldData>

export const ScaleValue = z.number().min(1)
export type ScaleValue = z.infer<typeof ScaleValue>


export const PointFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.point.id),
}).strict()
export type PointFieldData = z.infer<typeof PointFieldData>

export const PointValue = z.object({
	x: z.number(),
	y: z.number()
})
export type PointValue = z.infer<typeof PointValue>


export const FilesFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.files.id),
}).strict()
export type FilesFieldData = z.infer<typeof FilesFieldData>

export const FilesValue = z.array(z.string())
export type FilesValue = z.infer<typeof FilesValue>

export const ImagesFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.images.id),
}).strict()
export type ImagesFieldData = z.infer<typeof ImagesFieldData>

export const ImagesValue = z.array(z.string())
export type ImagesValue = z.infer<typeof ImagesValue>
