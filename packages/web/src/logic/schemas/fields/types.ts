
// todo: remove id value and just use key?
export const FIELDS = {
	// Basics
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
	boolean: {
		label: "Boolean",
		id: "boolean",
	},
	number: {
		label: "Number",
		id: "number",
	},
	date: {
		label: "Date",
		id: "date",
	},
	timestamp: {
		label: "Timestamp",
		id: "timestamp",
	},
	// References
	referenceOne: {
		label: "Reference One",
		id: "referenceOne",
	},
	referenceMany: {
		label: "Reference Many",
		id: "referenceMany",
	},
	// Select
	selectOne: {
		label: "Select (one)",
		id: "selectOne",
	},
	selectMany: {
		label: "Select (many)",
		id: "selectMany",
	},
	// Special
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
} as const

export const FieldTypes = [
	// Basics
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
	// References
	FIELDS.referenceOne.id,
	FIELDS.referenceMany.id,
	// Select
	FIELDS.selectOne.id,
	FIELDS.selectMany.id,
	// Special
	FIELDS.scale.id,
	FIELDS.point.id,
	FIELDS.files.id,
	FIELDS.images.id,
] as const
export type FieldTypes = keyof typeof FIELDS
