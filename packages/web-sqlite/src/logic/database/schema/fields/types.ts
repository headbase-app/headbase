
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
