import {z} from "zod";
import {FIELDS} from "../types.ts";
import {IdField} from "../../common/fields.ts";
import {BaseFieldData} from "./base.ts";

export const ReferenceOneFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.referenceOne.id),
	settings: z.null()
}).strict()
export type ReferenceOneFieldData = z.infer<typeof ReferenceOneFieldData>


// todo: validate as id?
export const ReferenceOneValue = IdField
export type ReferenceOneValue = z.infer<typeof ReferenceOneValue>


export const ReferenceManyFieldData = BaseFieldData.extend({
	type: z.literal(FIELDS.referenceMany.id),
	settings: z.null()
}).strict()
export type ReferenceManyFieldData = z.infer<typeof ReferenceManyFieldData>

export const ReferenceManyValue = z.array(IdField)
export type ReferenceManyValue = z.infer<typeof ReferenceOneValue>
