import {z} from "zod";
import {FIELDS} from "../types.ts";
import {BaseFieldData} from "./base.ts";


export const TextShortFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.textShort.id),
	settings: z.null()
}).strict()
export type TextShortFieldData = z.infer<typeof TextShortFieldData>

export const TextShortValue = z.string().max(255, 'must be 255 characters of less')
export type TextShortValue = z.infer<typeof TextShortValue>


export const TextLongFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.textLong.id),
	settings: z.null()
}).strict()
export type TextLongFieldData = z.infer<typeof TextLongFieldData>

export const TextLongValue = z.string()
export type TextLongValue = z.infer<typeof TextLongValue>


export const MarkdownFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.markdown.id),
	settings: z.object({
		defaultLines: z.number().int().min(1)
	})
}).strict()
export type MarkdownFieldData = z.infer<typeof MarkdownFieldData>

export const MarkdownValue = z.string()
export type MarkdownValue = z.infer<typeof MarkdownValue>


export const URLFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.url.id),
	settings: z.null()
}).strict()
export type URLFieldData = z.infer<typeof URLFieldData>

export const URLValue = z.string().url('must be a valid URL')
export type URLValue = z.infer<typeof URLValue>


export const EmailFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.email.id),
	settings: z.null()
}).strict()
export type EmailFieldData = z.infer<typeof EmailFieldData>

export const EmailValue = z.string().url('must be a valid email')
export type EmailValue = z.infer<typeof EmailValue>


export const ColourFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.colour.id),
	settings: z.null()
}).strict()
export type ColourFieldData = z.infer<typeof ColourFieldData>

// todo: validate as hex colour?
export const ColourValue = z.string()
export type ColourValue = z.infer<typeof ColourValue>


export const PhoneFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.phone.id),
	settings: z.null()
}).strict()
export type PhoneFieldData = z.infer<typeof PhoneFieldData>

// todo: validate specific phone format?
export const PhoneValue = z.string()
export type PhoneValue = z.infer<typeof PhoneValue>


export const BooleanFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.boolean.id),
	settings: z.null()
}).strict()
export type BooleanFieldData = z.infer<typeof BooleanFieldData>

export const BooleanValue = z.boolean()
export type BooleanValue = z.infer<typeof BooleanValue>


export const NumberFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.number.id),
	settings: z.null()
}).strict()
export type NumberFieldData = z.infer<typeof NumberFieldData>

export const NumberValue = z.number()
export type NumberValue = z.infer<typeof NumberValue>


export const DateFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.date.id),
	settings: z.null()
}).strict()
export type DateFieldData = z.infer<typeof DateFieldData>

export const DateValue = z.string().date('must be a valid date in format YYYY-MM-DD')
export type DateValue = z.infer<typeof BooleanValue>


export const TimestampFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.timestamp.id),
	settings: z.null()
}).strict()
export type TimestampFieldData = z.infer<typeof TimestampFieldData>

export const TimestampValue = z.string().datetime('must be a valid timestamp')
export type TimestampValue = z.infer<typeof TimestampValue>
