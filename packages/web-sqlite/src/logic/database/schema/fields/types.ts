import {
	BooleanFieldData,
	BooleanValue, ColourFieldData, ColourValue, DateFieldData, DateValue, EmailFieldData, EmailValue, MarkdownFieldData,
	MarkdownValue, NumberFieldData, NumberValue, PhoneFieldData, PhoneValue, TextLongFieldData,
	TextLongValue, TextShortFieldData,
	TextShortValue, TimestampFieldData, TimestampValue, URLFieldData, URLValue
} from "./types/basic.ts";
import {SelectFieldData, SelectMultipleFieldData, SelectMultipleValue, SelectValue} from "./types/select.ts";
import {
	FilesFieldData,
	FilesValue, ImagesFieldData,
	ImagesValue, PointFieldData,
	PointValue, ScaleFieldData,
	ScaleValue
} from "./types/special.ts";
import {
	ReferenceManyFieldData,
	ReferenceManyValue, ReferenceOneFieldData,
	ReferenceOneValue
} from "./types/references.ts";

export const FIELDS = {
	textShort: {
		label: "Short Text",
		id: "textShort",
	},
	textLong: {
		label: "Long Text",
		id: "textLong",
	},
	markdown: {
		label: "Markdown",
		id: "markdown",
	},
	url: {
		label: "URL",
		id: "url",
	},
	email: {
		label: "Email",
		id: "email",
	},
	colour: {
		label: "Colour",
		id: "colour",
	},
	phone: {
		label: "Phone",
		id: "phone",
	},
	number: {
		label: "Number",
		id: "number",
	},
	boolean: {
		label: "Boolean",
		id: "boolean",
	},
	date: {
		label: "Date",
		id: "date",
	},
	timestamp: {
		label: "Timestamp",
		id: "timestamp",
	},
	select: {
		label: "Select",
		id: "select",
	},
	selectMultiple: {
		label: "Select multiple",
		id: "selectMultiple",
	},
	scale: {
		label: "Scale",
		id: "scale",
	},
	point: {
		label: "Point",
		id: "point",
	},
	files: {
		label: "Files",
		id: "files",
	},
	images: {
		label: "Images",
		id: "images",
	},
	referenceOne: {
		label: "Reference One",
		id: "referenceOne",
	},
	referenceMany: {
		label: "Reference Many",
		id: "referenceMany",
	}
} as const

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

export const FieldTypes = [
	FIELDS.textShort.id,
	FIELDS.textLong.id,
	FIELDS.markdown.id,
	FIELDS.url.id,
	FIELDS.email.id,
	FIELDS.colour.id,
	FIELDS.phone.id,
	FIELDS.boolean.id,
	FIELDS.date.id,
	FIELDS.timestamp.id,
	FIELDS.select.id,
	FIELDS.selectMultiple.id,
	FIELDS.scale.id,
	FIELDS.point.id,
	FIELDS.files.id,
	FIELDS.images.id,
	FIELDS.referenceOne.id,
	FIELDS.referenceMany.id,
] as const
export type FieldTypes = keyof typeof FIELDS
