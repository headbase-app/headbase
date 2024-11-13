import {z} from "zod";
import {FIELD_TYPES} from "../types.ts";

export const _BaseSelectSettings = z.object({
	options: z.array(z.object({
		label: z.string(),
		value: z.string(),
		colour: z.string().optional(),
	}))
}).strict()

export const SelectSettings = z.object({
	type: z.literal(FIELD_TYPES.select.id),
	settings: _BaseSelectSettings
}).strict()
export type SelectSettings = z.infer<typeof SelectSettings>

export const SelectValue = z.string()
export type SelectValue = z.infer<typeof SelectValue>


export const SelectMultipleSettings = z.object({
	type: z.literal(FIELD_TYPES.selectMultiple.id),
	settings: _BaseSelectSettings
}).strict()
export type SelectMultipleSettings = z.infer<typeof SelectMultipleSettings>

export const SelectMultipleValue = z.array(z.string())
export type SelectMultipleValue = z.infer<typeof SelectValue>
