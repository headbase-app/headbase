import {z} from "zod";
import {FIELD_TYPES} from "../../field-types.ts";


export const FieldURLSettings = z.object({
	type: z.literal(FIELD_TYPES.url.id),
}).strict()
export type FieldURLSettings = z.infer<typeof FieldURLSettings>


export const FieldEmailSettings = z.object({
	type: z.literal(FIELD_TYPES.email.id),
}).strict()
export type FieldEmailSettings = z.infer<typeof FieldEmailSettings>


export const FieldColourSettings = z.object({
	type: z.literal(FIELD_TYPES.colour.id),
}).strict()
export type FieldColourSettings = z.infer<typeof FieldColourSettings>


export const FieldPhoneSettings = z.object({
	type: z.literal(FIELD_TYPES.phone.id),
}).strict()
export type FieldPhoneSettings = z.infer<typeof FieldPhoneSettings>


export const FieldBooleanSettings = z.object({
	type: z.literal(FIELD_TYPES.boolean.id),
}).strict()
export type FieldBooleanSettings = z.infer<typeof FieldBooleanSettings>


export const FieldDateSettings = z.object({
	type: z.literal(FIELD_TYPES.date.id),
}).strict()
export type FieldDateSettings = z.infer<typeof FieldDateSettings>


export const FieldTimestampSettings = z.object({
	type: z.literal(FIELD_TYPES.timestamp.id),
}).strict()
export type FieldTimestampSettings = z.infer<typeof FieldTimestampSettings>


export const FieldSelectSettings = z.object({
	type: z.literal(FIELD_TYPES.select.id),
	settings: z.object({
		options: z.array(z.object({
			label: z.string(),
			value: z.string(),
			colour: z.string().optional(),
		}))
	})
}).strict()
export type FieldSelectSettings = z.infer<typeof FieldSelectSettings>


export const FieldSelectMultipleSettings = z.object({
	type: z.literal(FIELD_TYPES.selectMultiple.id),
	settings: z.object({
		options: z.array(z.object({
			label: z.string(),
			value: z.string(),
			colour: z.string().optional(),
		}))
	})
}).strict()
export type FieldSelectMultipleSettings = z.infer<typeof FieldSelectMultipleSettings>


export const FieldScaleSettings = z.object({
	type: z.literal(FIELD_TYPES.scale.id),
	settings: z.object({
		minLabel: z.string()
			.min(1, "minimum label must be between 1 and 20 chars")
			.max(20, "minimum label must be between 1 and 20 chars"),
		maxLabel: z.string()
			.min(1, "max label must be between 1 and 20 chars")
			.max(20, "max label must be between 1 and 20 chars"),
		scale: z.number()
			.int()
			.min(3, "scale must be between 3 and 10")
			.max(10,  "scale must be between 3 and 10")
	})
}).strict()
export type FieldScaleSettings = z.infer<typeof FieldScaleSettings>


export const FieldPointSettings = z.object({
	type: z.literal(FIELD_TYPES.point.id),
}).strict()
export type FieldPointSettings = z.infer<typeof FieldPointSettings>


export const FieldFilesSettings = z.object({
	type: z.literal(FIELD_TYPES.files.id),
}).strict()
export type FieldFilesSettings = z.infer<typeof FieldFilesSettings>


export const FieldImagesSettings = z.object({
	type: z.literal(FIELD_TYPES.images.id),
}).strict()
export type FieldImagesSettings = z.infer<typeof FieldImagesSettings>


export const FieldReferenceOneSettings = z.object({
	type: z.literal(FIELD_TYPES.referenceOne.id),
}).strict()
export type FieldReferenceOneSettings = z.infer<typeof FieldReferenceOneSettings>


export const FieldReferenceManySettings = z.object({
	type: z.literal(FIELD_TYPES.referenceMany.id),
}).strict()
export type FieldReferenceManySettings = z.infer<typeof FieldReferenceManySettings>


/**
 * Short plain text field.
 */
export const FieldShortText = FieldBase.extend({
	type: z.literal(FIELD_TYPES.textShort.identifier),
}).strict()
export type FieldShortText = z.infer<typeof FieldShortText>

export const FieldShortTextValue = z.string()
	.max(100, "must be between 1 and 100 chars")
	.optional()
export type FieldShortTextValue = z.infer<typeof FieldShortTextValue>

/**
 * Long plain text field.
 */
export const FieldLongText = FieldBase.extend({
	type: z.literal(FIELD_TYPES.textLong.identifier),
}).strict()
export type FieldLongText = z.infer<typeof FieldLongText>

export const FieldLongTextValue = FieldBasicStringValue
export type FieldLongTextValue = FieldBasicStringValue

/**
 * Markdown field.
 */
export const FieldMarkdown = FieldBase.extend({
	type: z.literal(FIELD_TYPES.markdown.identifier),
	lines: z.number().optional()
}).strict()
export type FieldMarkdown = z.infer<typeof FieldMarkdown>

export const FieldMarkdownValue = FieldBasicStringValue
export type FieldMarkdownValue = FieldBasicStringValue


/**
 * Options field.
 */
export const FieldOptions = FieldBase.extend({
	type: z.literal(FIELD_TYPES.options.identifier),
	options: z.array(z.string())
		.min(2, "you must have at least two options"),
}).strict()
export type FieldOptions = z.infer<typeof FieldOptions>

export const FieldOptionsValue = FieldBasicStringValue
export type FieldOptionsValue = FieldBasicStringValue

/**
 * URL field.
 */
export const FieldURL = FieldBase.extend({
	type: z.literal(FIELD_TYPES.url.identifier),
}).strict()
export type FieldURL = z.infer<typeof FieldURL>

export const FieldURLValue = z.string()
	.url("must be a valid URL.")
	.optional()
export type FieldURLValue = z.infer<typeof FieldURLValue>

/**
 * Number field.
 */
export const FieldNumber = FieldBase.extend({
	type: z.literal(FIELD_TYPES.number.identifier),
}).strict()
export type FieldNumber = z.infer<typeof FieldNumber>

export const FieldNumberValue = z.number()
	.optional()
export type FieldNumberValue = z.infer<typeof FieldNumberValue>

/**
 * Scale field.
 */
export const FieldScale = FieldBase.extend({
	type: z.literal(FIELD_TYPES.scale.identifier),
	minLabel: z.string()
		.min(1, "minimum label must be between 1 and 20 chars")
		.max(20, "minimum label must be between 1 and 20 chars"),
	maxLabel: z.string()
		.min(1, "max label must be between 1 and 20 chars")
		.max(20, "max label must be between 1 and 20 chars"),
	scale: z.number()
		.int()
		.min(3, "scale must be between 3 and 10")
		.max(10,  "scale must be between 3 and 10")
}).strict()
export type FieldScale = z.infer<typeof FieldScale>

export const FieldScaleValue = z.number()
	.int("value must be an integer")
	.optional()
export type FieldScaleValue = z.infer<typeof FieldScaleValue>

/**
 * Boolean field.
 */
export const FieldBoolean = FieldBase.extend({
	type: z.literal(FIELD_TYPES.boolean.identifier),
}).strict()
export type FieldBoolean = z.infer<typeof FieldBoolean>

export const FieldBooleanValue = z.boolean().optional()
export type FieldBooleanValue = z.infer<typeof FieldBooleanValue>

/**
 * Date field (YYYY-MM-DD).
 */
export const FieldDate= FieldBase.extend({
	type: z.literal(FIELD_TYPES.date.identifier),
}).strict()
export type FieldDate = z.infer<typeof FieldDate>

export const FieldDateValue = z.string()
	.optional()
	.refine(
		(v) => {
			return v === undefined ? true : isISO8601Date(v)
		},
		{message: "Date must be in format YYYY-MM-DD"}
	)
export type FieldDateValue = FieldBasicStringValue

/**
 * Timestamp field.
 */
export const FieldTimestamp= FieldBase.extend({
	type: z.literal(FIELD_TYPES.timestamp.identifier),
}).strict()
export type FieldTimestamp = z.infer<typeof FieldTimestamp>

export const FieldTimestampValue= z.string().datetime().optional()
export type FieldTimestampValue = z.infer<typeof FieldTimestampValue>

/**
 * Field definition combining all fields together.
 */
export const FieldDefinition = z.union([
	// Text Fields
	FieldShortText,
	FieldLongText,
	FieldMarkdown,
	// Custom Fields
	FieldOptions,
	FieldURL,
	// Basic Types Fields
	FieldNumber,
	FieldScale,
	FieldBoolean,
	// Date Fields
	FieldDate,
	FieldTimestamp,
])
export type FieldDefinition = z.infer<typeof FieldDefinition>

export const FieldValues = z.union([
	// Text Fields
	FieldShortText.pick({type: true}).extend({value: FieldShortTextValue}),
	FieldLongText.pick({type: true}).extend({value: FieldLongTextValue}),
	FieldMarkdown.pick({type: true}).extend({value: FieldMarkdownValue}),
	// Custom Fields
	FieldOptions.pick({type: true}).extend({value: FieldOptionsValue}),
	FieldURL.pick({type: true}).extend({value: FieldURLValue}),
	// Basic Types Fields
	FieldNumber.pick({type: true}).extend({value: FieldNumberValue}),
	FieldScale.pick({type: true}).extend({value: FieldScaleValue}),
	FieldBoolean.pick({type: true}).extend({value: FieldBooleanValue}),
	// Date Fields
	FieldDate.pick({type: true}).extend({value: FieldDateValue}),
	FieldTimestamp.pick({type: true}).extend({value: FieldTimestampValue}),
])
export type FieldValues = z.infer<typeof FieldValues>

export const FieldStorage = z.record(
	createIdField(),
	FieldValues
)
export type FieldStorage = z.infer<typeof FieldStorage>
