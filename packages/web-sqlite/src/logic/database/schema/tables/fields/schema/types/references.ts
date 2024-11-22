import {z} from "zod";
import {FIELD_TYPES} from "../types.ts";
import {IdField} from "../../../../common.ts";

export const ReferenceOneSettings = z.object({
	type: z.literal(FIELD_TYPES.referenceOne.id),
}).strict()
export type ReferenceOneSettings = z.infer<typeof ReferenceOneSettings>


// todo: validate as id?
export const ReferenceOneValue = IdField
export type ReferenceOneValue = z.infer<typeof ReferenceOneValue>


export const ReferenceManySettings = z.object({
	type: z.literal(FIELD_TYPES.referenceMany.id),
}).strict()
export type ReferenceManySettings = z.infer<typeof ReferenceManySettings>

export const ReferenceManyValue = z.array(IdField)
export type ReferenceManyValue = z.infer<typeof ReferenceOneValue>
