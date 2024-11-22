
export const FIELD_TYPES =  {
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

export const FieldTypes = [
	FIELD_TYPES.textShort.id,
	FIELD_TYPES.textLong.id,
	FIELD_TYPES.markdown.id,
	FIELD_TYPES.url.id,
	FIELD_TYPES.email.id,
	FIELD_TYPES.colour.id,
	FIELD_TYPES.phone.id,
	FIELD_TYPES.boolean.id,
	FIELD_TYPES.date.id,
	FIELD_TYPES.timestamp.id,
	FIELD_TYPES.select.id,
	FIELD_TYPES.selectMultiple.id,
	FIELD_TYPES.scale.id,
	FIELD_TYPES.point.id,
	FIELD_TYPES.files.id,
	FIELD_TYPES.images.id,
	FIELD_TYPES.referenceOne.id,
	FIELD_TYPES.referenceMany.id,
] as const;
export type FieldTypes = keyof typeof FIELD_TYPES
