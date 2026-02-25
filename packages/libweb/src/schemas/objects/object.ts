import {z} from "zod";

const PrimitiveValue = z.union([
	z.string(), z.number(), z.boolean(), z.null(),
])
type PrimitiveValue = string | number | boolean | null

export type ObjectFields = {
	[key: string]: PrimitiveValue | PrimitiveValue[] | ObjectFields
}
export const ObjectFields: z.ZodSchema<ObjectFields> = z.lazy(() => z.record(
	z.string(),
	z.union([PrimitiveValue, z.array(PrimitiveValue), ObjectFields])
))

export const ObjectDto = z.object({
	// todo: spec and type should be a URL/URI?
	spec: z.string("spec must be a string"),
	type: z.string("type must be a string"),
	id: z.string("id must be a uuid"),
	versionId: z.string("versionId must be a uuid"),
	previousVersionId: z.string("previousVersionId must be a uuid").nullable(),
	fields: ObjectFields,
	blob: z.instanceof(ArrayBuffer, {error: "blob should be an array buffer"}).nullable().optional(),
	createdAt: z.iso.datetime("createdAt must be a ISO 8601 formatted timestamp"),
	createdBy: z.string()
		.min(1, "createdBy must be between 1 and 100 characters")
		.max(100, "createdBy must be between 1 and 100 characters"),
	updatedAt: z.iso.datetime("updatedAt must be a ISO 8601 formatted timestamp"),
	updatedBy: z.string()
		.min(1, "updatedBy must be between 1 and 100 characters")
		.max(100, "updatedBy must be between 1 and 100 characters"),
	deletedAt: z.iso.datetime("deletedAt must be a ISO 8601 formatted timestamp").nullable(),
	deletedBy: z.string()
		.min(1, "deletedBy must be between 1 and 100 characters")
		.max(100, "deletedBy must be between 1 and 100 characters")
		.nullable(),
})
export type ObjectDto = z.infer<typeof ObjectDto>;
