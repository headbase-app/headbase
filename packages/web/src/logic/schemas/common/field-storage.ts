import z from 'zod'
import {
	BooleanFieldData,
	BooleanValue, ColourFieldData,
	ColourValue, DateFieldData, DateValue, EmailFieldData,
	EmailValue, MarkdownFieldData,
	MarkdownValue, NumberFieldData, NumberValue, PhoneFieldData, PhoneValue, TextLongFieldData,
	TextLongValue, TextShortFieldData,
	TextShortValue, TimestampFieldData, TimestampValue, URLFieldData, URLValue
} from "../fields/types/basic.ts";
import {SelectFieldData, SelectMultipleFieldData, SelectMultipleValue, SelectValue} from "../fields/types/select.ts";
import {
	FilesFieldData,
	FilesValue, ImagesFieldData, ImagesValue, PointFieldData,
	PointValue, ScaleFieldData,
	ScaleValue
} from "../fields/types/special.ts";
import {
	ReferenceManyFieldData,
	ReferenceManyValue, ReferenceOneFieldData,
	ReferenceOneValue
} from "../fields/types/references.ts";
import {createIdField} from "@headbase-app/common";

export const FieldValues = z.union([
	TextShortFieldData.pick({type: true}).extend({value: TextShortValue}),
	TextLongFieldData.pick({type: true}).extend({value: TextLongValue}),
	MarkdownFieldData.pick({type: true}).extend({value: MarkdownValue}),
	URLFieldData.pick({type: true}).extend({value: URLValue}),
	EmailFieldData.pick({type: true}).extend({value: EmailValue}),
	ColourFieldData.pick({type: true}).extend({value: ColourValue}),
	PhoneFieldData.pick({type: true}).extend({value: PhoneValue}),
	NumberFieldData.pick({type: true}).extend({value: NumberValue}),
	BooleanFieldData.pick({type: true}).extend({value: BooleanValue}),
	DateFieldData.pick({type: true}).extend({value: DateValue}),
	TimestampFieldData.pick({type: true}).extend({value: TimestampValue}),
	SelectFieldData.pick({type: true}).extend({value: SelectValue}),
	SelectMultipleFieldData.pick({type: true}).extend({value: SelectMultipleValue}),
	ScaleFieldData.pick({type: true}).extend({value: ScaleValue}),
	PointFieldData.pick({type: true}).extend({value: PointValue}),
	FilesFieldData.pick({type: true}).extend({value: FilesValue}),
	ImagesFieldData.pick({type: true}).extend({value: ImagesValue}),
	ReferenceOneFieldData.pick({type: true}).extend({value: ReferenceOneValue}),
	ReferenceManyFieldData.pick({type: true}).extend({value: ReferenceManyValue}),
])
export type FieldValues = z.infer<typeof FieldValues>

export const FieldStorage = z.record(
	createIdField(),
	FieldValues
)
export type FieldStorage = z.infer<typeof FieldStorage>
