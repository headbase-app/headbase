import {z} from "zod";

export const FieldBase = z.object({
	label: z.string(),
	icon: z.string().nullish(),
	hint: z.string().nullish(),
}).strict()
export type FieldBase = z.infer<typeof FieldBase>

/**
 * Fields Types
 */
export const ShortTextField = FieldBase.extend({
	type: z.literal("short-text"),
	defaultValue: z.string().nullish(),
}).strict()
export type ShortTextField = z.infer<typeof ShortTextField>

export const LongTextField = FieldBase.extend({
	type: z.literal("long-text"),
	defaultValue: z.string().nullish(),
}).strict()
export type LongTextField = z.infer<typeof LongTextField>

export const NumberField = FieldBase.extend({
	type: z.literal("number"),
	defaultValue: z.number().nullish(),
}).strict()
export type NumberField = z.infer<typeof NumberField>

export const GlobField = FieldBase.extend({
	type: z.literal("glob"),
	defaultValue: z.string().nullish(),
}).strict()
export type GlobField = z.infer<typeof GlobField>

export const EmailField = FieldBase.extend({
	type: z.literal("email"),
	defaultValue: z.string().nullish(),
}).strict()
export type EmailField = z.infer<typeof EmailField>

export const PhoneField = FieldBase.extend({
	type: z.literal("phone"),
	defaultValue: z.string().nullish(),
}).strict()
export type PhoneField = z.infer<typeof PhoneField>

export const CheckboxField = FieldBase.extend({
	type: z.literal("checkbox"),
	defaultValue: z.boolean().nullish(),
}).strict()
export type CheckboxField = z.infer<typeof CheckboxField>

export const RangeField = FieldBase.extend({
	type: z.literal("range"),
	defaultValue: z.number().nullish(),
	settings: z.object({
		min: z.number().nullish(),
		max: z.number().nullish(),
	})
}).strict()
export type RangeField = z.infer<typeof RangeField>

export const SelectField = FieldBase.extend({
	type: z.literal("select"),
	defaultValue: z.string().nullish(),
	settings: z.object({
		options: z.string(),
	}).strict()
}).strict()
export type SelectField = z.infer<typeof SelectField>

export const MultiSelectField = FieldBase.extend({
	type: z.literal("multi-select"),
	defaultValue: z.string().nullish(),
	settings: z.object({
		options: z.array(z.string()),
	}).strict()
}).strict()
export type MultiSelectField = z.infer<typeof MultiSelectField>

/**
 * Dynamic Fields
 */
export const FieldTypes = z.discriminatedUnion("type", [
	ShortTextField, LongTextField, NumberField,
	GlobField, EmailField, PhoneField,
	CheckboxField, RangeField, SelectField, MultiSelectField
])
export type FieldTypes = z.infer<typeof FieldTypes>

export const DynamicFields = z.record(z.string(), FieldTypes)
export type DynamicFields = z.infer<typeof DynamicFields>

/**
 * Type Helpers
 */
interface FieldLookup {
	"short-text": ShortTextField,
	"long-text": LongTextField,
	"number": NumberField,
	"glob": GlobField,
	"email": EmailField,
	"phone": PhoneField,
	"checkbox": CheckboxField,
	"range": RangeField,
	"select": SelectField,
	"multi-select": MultiSelectField
}

export type InferObjectFromFieldDefinitions<F extends DynamicFields> = {
	[K in keyof F]: NonNullable<FieldLookup[F[K]["type"]]["defaultValue"]>
}
