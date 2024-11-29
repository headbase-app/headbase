import {z} from "zod";
import {DescriptionField, IconField, NameField} from "../../common/fields.ts";

export const BaseFieldData = z.object({
	name: NameField,
	description: DescriptionField,
	icon: IconField
})
export type BaseFieldData = z.infer<typeof BaseFieldData>
