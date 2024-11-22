import {
	BooleanSettings,
	BooleanValue,
	ColourSettings,
	ColourValue,
	DateSettings,
	DateValue,
	EmailSettings,
	EmailValue,
	MarkdownSettings,
	MarkdownValue,
	NumberSettings,
	NumberValue,
	PhoneSettings,
	PhoneValue, TextLongSettings, TextLongValue,
	TextShortSettings, TextShortValue,
	TimestampSettings,
	TimestampValue,
	URLSettings,
	URLValue
} from "./types/basic.ts";
import {SelectMultipleSettings, SelectMultipleValue, SelectSettings, SelectValue} from "./types/select.ts";
import {
	FilesSettings,
	FilesValue,
	ImagesSettings, ImagesValue,
	PointSettings,
	PointValue,
	ScaleSettings,
	ScaleValue
} from "./types/special.ts";
import {
	ReferenceManySettings,
	ReferenceManyValue,
	ReferenceOneSettings,
	ReferenceOneValue
} from "./types/references.ts";

export const FIELD_SCHEMAS =  {
	textShort: {
		settings: TextShortSettings,
		value: TextShortValue
	},
	textLong: {
		settings: TextLongSettings,
		value: TextLongValue
	},
	markdown: {
		settings: MarkdownSettings,
		value: MarkdownValue
	},
	url: {
		settings: URLSettings,
		value: URLValue
	},
	email: {
		settings: EmailSettings,
		value: EmailValue
	},
	colour: {
		settings: ColourSettings,
		value: ColourValue
	},
	phone: {
		settings: PhoneSettings,
		value: PhoneValue
	},
	number: {
		settings: NumberSettings,
		value: NumberValue
	},
	boolean: {
		settings: BooleanSettings,
		value: BooleanValue
	},
	timestamp: {
		settings: TimestampSettings,
		value: TimestampValue
	},
	date: {
		settings: DateSettings,
		value: DateValue
	},
	select: {
		settings: SelectSettings,
		value: SelectValue
	},
	selectMultiple: {
		settings: SelectMultipleSettings,
		value: SelectMultipleValue,
	},
	scale: {
		settings: ScaleSettings,
		value: ScaleValue
	},
	point: {
		settings: PointSettings,
		value: PointValue
	},
	files: {
		settings: FilesSettings,
		value: FilesValue
	},
	images: {
		settings: ImagesSettings,
		value: ImagesValue
	},
	referenceOne: {
		settings: ReferenceOneSettings,
		value: ReferenceOneValue
	},
	referenceMany: {
		settings: ReferenceManySettings,
		value: ReferenceManyValue
	}
} as const

export type AllFieldSettings =
	TextShortSettings |
	TextLongSettings |
	MarkdownSettings |
	URLSettings |
	EmailSettings |
	ColourSettings |
	PhoneSettings |
	NumberSettings |
	BooleanSettings |
	TimestampSettings |
	DateSettings |
	SelectSettings |
	SelectMultipleSettings |
	ScaleSettings |
	PointSettings |
	FilesSettings |
	ImagesSettings |
	ReferenceOneSettings |
	ReferenceManySettings

export interface FieldDtoFields {
	label: string,
	description: string | null,
	icon: string | null,
}
