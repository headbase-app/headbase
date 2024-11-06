import {z} from "zod";
import {FIELD_TYPES} from "../types.ts";


export const TextShortSettings = z.object({
	type: z.literal(FIELD_TYPES.textShort.id),
}).strict()
export type TextShortSettings = z.infer<typeof TextShortSettings>

export const TextShortValue = z.string().max(255, 'must be 255 characters of less')
export type TextShortValue = z.infer<typeof TextShortValue>


export const TextLongSettings = z.object({
	type: z.literal(FIELD_TYPES.textLong.id),
}).strict()
export type TextLongSettings = z.infer<typeof TextLongSettings>

export const TextLongValue = z.string()
export type TextLongValue = z.infer<typeof TextLongValue>


export const  MarkdownSettings = z.object({
	type: z.literal(FIELD_TYPES.markdown.id),
	settings: z.object({
		defaultLines: z.number().int().min(1)
	})
}).strict()
export type MarkdownSettings = z.infer<typeof MarkdownSettings>

export const MarkdownValue = z.string()
export type MarkdownValue = z.infer<typeof MarkdownValue>


export const URLSettings = z.object({
	type: z.literal(FIELD_TYPES.url.id),
}).strict()
export type URLSettings = z.infer<typeof URLSettings>

export const URLValue = z.string().url('must be a valid URL')
export type URLValue = z.infer<typeof URLValue>


export const EmailSettings = z.object({
	type: z.literal(FIELD_TYPES.email.id),
}).strict()
export type EmailSettings = z.infer<typeof EmailSettings>

export const EmailValue = z.string().url('must be a valid email')
export type EmailValue = z.infer<typeof EmailValue>


export const ColourSettings = z.object({
	type: z.literal(FIELD_TYPES.colour.id),
}).strict()
export type ColourSettings = z.infer<typeof ColourSettings>

// todo: validate as hex colour?
export const ColourValue = z.string()
export type ColourValue = z.infer<typeof ColourValue>


export const PhoneSettings = z.object({
	type: z.literal(FIELD_TYPES.phone.id),
}).strict()
export type PhoneSettings = z.infer<typeof PhoneSettings>

// todo: validate specific phone format?
export const PhoneValue = z.string()
export type PhoneValue = z.infer<typeof PhoneValue>


export const BooleanSettings = z.object({
	type: z.literal(FIELD_TYPES.boolean.id),
}).strict()
export type BooleanSettings = z.infer<typeof BooleanSettings>

export const BooleanValue = z.boolean()
export type BooleanValue = z.infer<typeof BooleanValue>


export const NumberSettings = z.object({
	type: z.literal(FIELD_TYPES.number.id),
}).strict()
export type NumberSettings = z.infer<typeof NumberSettings>

export const NumberValue = z.number()
export type NumberValue = z.infer<typeof NumberValue>


export const DateSettings = z.object({
	type: z.literal(FIELD_TYPES.date.id),
}).strict()
export type DateSettings = z.infer<typeof DateSettings>

export const DateValue = z.string().date('must be a valid date in format YYYY-MM-DD')
export type DateValue = z.infer<typeof BooleanValue>


export const TimestampSettings = z.object({
	type: z.literal(FIELD_TYPES.timestamp.id),
}).strict()
export type TimestampSettings = z.infer<typeof TimestampSettings>

export const TimestampValue = z.string().datetime('must be a valid timestamp')
export type TimestampValue = z.infer<typeof TimestampValue>
