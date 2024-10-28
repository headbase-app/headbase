import {z} from "zod";
import { JColourVariantsList } from "@ben-ryder/jigsaw-react";
import {createIdField} from "@headbase-app/common"

// IndexDB can't index boolean types (true, false) so 0 and 1 must be used instead.
export const BooleanField = z.union([z.literal(0), z.literal(1)])
export type BooleanField = z.infer<typeof BooleanField>

export const TimestampField = z.string().datetime()
export type TimestampField = z.infer<typeof TimestampField>

export const NameField = z.string()
	.min(1, "name length must be between 1 and 50 chars")
	.max(50, "name length must be between 1 and 50 chars")
export type NameField = z.infer<typeof NameField>

export const DescriptionField = z.string()
	.max(200, "description length must be between 1 and 200 chars")
	.optional()
export type DescriptionField = z.infer<typeof DescriptionField>

export const EntityReferenceListField = z.array(createIdField())
export type EntityReferenceListField = z.infer<typeof EntityReferenceListField>

// These are directly mapped from Jigsaw colour variants right now.
export const ColourVariants = z.enum(JColourVariantsList);
export type ColourVariants = z.infer<typeof ColourVariants>;

export const IsFavouriteField = z.boolean()
	.optional()
export type IsFavouriteField = z.infer<typeof IsFavouriteField>
