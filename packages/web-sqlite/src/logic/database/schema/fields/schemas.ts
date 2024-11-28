import {
	BooleanFieldData, BooleanValue,
	ColourFieldData, ColourValue, DateFieldData, DateValue,
	EmailFieldData, EmailValue,
	MarkdownFieldData, MarkdownValue, NumberFieldData, NumberValue, PhoneFieldData, PhoneValue,
	TextLongFieldData,
	TextLongValue,
	TextShortFieldData,
	TextShortValue, TimestampFieldData, TimestampValue, URLFieldData, URLValue
} from "./types/basic.ts";
import {SelectFieldData, SelectMultipleFieldData, SelectMultipleValue, SelectValue} from "./types/select.ts";
import {
	FilesFieldData,
	FilesValue,
	ImagesFieldData, ImagesValue,
	PointFieldData,
	PointValue,
	ScaleFieldData,
	ScaleValue
} from "./types/special.ts";
import {
	ReferenceManyFieldData,
	ReferenceManyValue,
	ReferenceOneFieldData,
	ReferenceOneValue
} from "./types/references.ts";

export const FIELD_SCHEMAS =  {
	textShort: {
		settings: TextShortFieldData,
		value: TextShortValue
	},
	textLong: {
		settings: TextLongFieldData,
		value: TextLongValue
	},
	markdown: {
		settings: MarkdownFieldData,
		value: MarkdownValue
	},
	url: {
		settings: URLFieldData,
		value: URLValue
	},
	email: {
		settings: EmailFieldData,
		value: EmailValue
	},
	colour: {
		settings: ColourFieldData,
		value: ColourValue
	},
	phone: {
		settings: PhoneFieldData,
		value: PhoneValue
	},
	number: {
		settings: NumberFieldData,
		value: NumberValue
	},
	boolean: {
		settings: BooleanFieldData,
		value: BooleanValue
	},
	timestamp: {
		settings: TimestampFieldData,
		value: TimestampValue
	},
	date: {
		settings: DateFieldData,
		value: DateValue
	},
	select: {
		settings: SelectFieldData,
		value: SelectValue
	},
	selectMultiple: {
		settings: SelectMultipleFieldData,
		value: SelectMultipleValue,
	},
	scale: {
		settings: ScaleFieldData,
		value: ScaleValue
	},
	point: {
		settings: PointFieldData,
		value: PointValue
	},
	files: {
		settings: FilesFieldData,
		value: FilesValue
	},
	images: {
		settings: ImagesFieldData,
		value: ImagesValue
	},
	referenceOne: {
		settings: ReferenceOneFieldData,
		value: ReferenceOneValue
	},
	referenceMany: {
		settings: ReferenceManyFieldData,
		value: ReferenceManyValue
	}
} as const
