import {z} from "zod";
import {FIELD_TYPES} from "../../field-types.ts";


export const ShortTextSettings = z.object({
	type: z.literal(FIELD_TYPES.textShort.id),
}).strict()
export type ShortTextSettings = z.infer<typeof ShortTextSettings>

export const ShortTextValue = z.string().max(255, 'must be 255 characters of less')
export type ShortTextValue = z.infer<typeof ShortTextValue>


export const LongTextSettings = z.object({
	type: z.literal(FIELD_TYPES.textLong.id),
}).strict()
export type LongTextSettings = z.infer<typeof LongTextSettings>

export const LongTextValue = z.string()
export type LongTextValue = z.infer<typeof LongTextValue>



export const FieldMarkdownSettings = z.object({
	type: z.literal(FIELD_TYPES.markdown.id),
	settings: z.object({
		defaultLines: z.number().int().min(1)
	})
}).strict()
export type FieldMarkdownSettings = z.infer<typeof FieldMarkdownSettings>

export const MarkdownValue = z.string()
export type MarkdownValue = z.infer<typeof MarkdownValue>