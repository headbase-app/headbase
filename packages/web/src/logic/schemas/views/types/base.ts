import {z} from "zod";
import {ColourField, DescriptionField, IconField, NameField} from "../../common/fields.ts";

export const BaseViewData = z.object({
	name: NameField,
	icon: IconField,
	colour: ColourField,
	description: DescriptionField,
	isFavourite: z.boolean(),
})
export type BaseViewData = z.infer<typeof BaseViewData>
