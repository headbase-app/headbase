import {z} from "zod"
import {ColourVariants, NameField} from "../common/fields";
import {EntityDto} from "@headbase-toolkit/types/data-entities";

export const TagData = z.object({
	name: NameField,
	colourVariant: ColourVariants.optional()
}).strict()
export type TagData = z.infer<typeof TagData>

export type TagDto = EntityDto<TagData>
