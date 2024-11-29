import {z} from "zod";
import {BooleanField, ColourField, DescriptionField, IconField, NameField} from "../../common/fields.ts";

export const BaseViewData = z.object({
	name: NameField,
	icon: IconField,
	colour: ColourField,
	description: DescriptionField,
	isFavourite: BooleanField,
})
export type BaseViewData = z.infer<typeof BaseViewData>
