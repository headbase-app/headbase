import z from 'zod'
import {
	BooleanSettings, BooleanValue,
	ColourSettings, ColourValue, DateSettings, DateValue,
	EmailSettings, EmailValue,
	MarkdownSettings, MarkdownValue, NumberSettings, NumberValue, PhoneSettings, PhoneValue,
	TextLongSettings,
	TextLongValue,
	TextShortSettings,
	TextShortValue, TimestampSettings, TimestampValue, URLSettings, URLValue
} from "./schema/types/basic.ts";
import {SelectMultipleSettings, SelectMultipleValue, SelectSettings, SelectValue} from "./schema/types/select.ts";
import {
	FilesSettings,
	FilesValue, ImagesSettings, ImagesValue,
	PointSettings,
	PointValue,
	ScaleSettings,
	ScaleValue
} from "./schema/types/special.ts";
import {
	ReferenceManySettings,
	ReferenceManyValue,
	ReferenceOneSettings,
	ReferenceOneValue
} from "./schema/types/references.ts";
import {IdField} from "../../common.ts";

export const FieldValues = z.union([
	TextShortSettings.pick({type: true}).extend({value: TextShortValue}),
	TextLongSettings.pick({type: true}).extend({value: TextLongValue}),
	MarkdownSettings.pick({type: true}).extend({value: MarkdownValue}),
	URLSettings.pick({type: true}).extend({value: URLValue}),
	EmailSettings.pick({type: true}).extend({value: EmailValue}),
	ColourSettings.pick({type: true}).extend({value: ColourValue}),
	PhoneSettings.pick({type: true}).extend({value: PhoneValue}),
	NumberSettings.pick({type: true}).extend({value: NumberValue}),
	BooleanSettings.pick({type: true}).extend({value: BooleanValue}),
	DateSettings.pick({type: true}).extend({value: DateValue}),
	TimestampSettings.pick({type: true}).extend({value: TimestampValue}),
	SelectSettings.pick({type: true}).extend({value: SelectValue}),
	SelectMultipleSettings.pick({type: true}).extend({value: SelectMultipleValue}),
	ScaleSettings.pick({type: true}).extend({value: ScaleValue}),
	PointSettings.pick({type: true}).extend({value: PointValue}),
	FilesSettings.pick({type: true}).extend({value: FilesValue}),
	ImagesSettings.pick({type: true}).extend({value: ImagesValue}),
	ReferenceOneSettings.pick({type: true}).extend({value: ReferenceOneValue}),
	ReferenceManySettings.pick({type: true}).extend({value: ReferenceManyValue}),
])
export type FieldValues = z.infer<typeof FieldValues>

export const FieldStorage = z.record(
	IdField,
	FieldValues
)
export type FieldStorage = z.infer<typeof FieldStorage>
