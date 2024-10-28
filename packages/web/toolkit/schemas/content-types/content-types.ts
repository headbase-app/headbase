import {z} from "zod"
import {ColourVariants, DescriptionField, NameField} from "../common/fields";
import {EntityDto} from "../entities";
import {createIdField} from "@headbase-app/common";

export const ContentTypeData = z.object({
	name: NameField,
	description: DescriptionField,
	icon: z.string().optional(),
	colourVariant: ColourVariants.optional(),
	contentTemplateName: NameField.optional(),
	contentTemplateTags: z.array(createIdField()).optional(),
	fields: z.array(createIdField())
}).strict()
export type ContentTypeData = z.infer<typeof ContentTypeData>

export type ContentTypeDto = EntityDto<ContentTypeData>
