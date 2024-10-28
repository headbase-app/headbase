export const FIELD_TYPES =  {
	textShort: {
		label: "Short Text",
		identifier: "textShort"
	},
	textLong: {
		label: "Long Text",
		identifier: "textLong"
	},
	markdown: {
		label: "Markdown",
		identifier: "markdown"
	},
	options: {
		label: "Options",
		identifier: "options"
	},
	url: {
		label: "URL",
		identifier: "url",
	},
	number: {
		label: "Number",
		identifier: "number",
	},
	scale: {
		label: "Scale",
		identifier: "scale",
	},
	boolean: {
		label: "Boolean",
		identifier: "boolean",
	},
	timestamp: {
		label: "Timestamp",
		identifier: "timestamp",
	},
	date: {
		label: "Date",
		identifier: "date",
	},
} as const

export const FieldTypes = [
	FIELD_TYPES.textShort.identifier,
	FIELD_TYPES.textLong.identifier,
	FIELD_TYPES.markdown.identifier,
	FIELD_TYPES.options.identifier,
	FIELD_TYPES.url.identifier,
	FIELD_TYPES.number.identifier,
	FIELD_TYPES.scale.identifier,
	FIELD_TYPES.boolean.identifier,
	FIELD_TYPES.timestamp.identifier,
	FIELD_TYPES.date.identifier,
] as const;
export type FieldTypes = keyof typeof FIELD_TYPES
