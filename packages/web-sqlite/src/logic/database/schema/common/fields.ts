import {z} from "zod";
import { JColourVariantsList } from "@ben-ryder/jigsaw-react";


export const IdField = z.string().uuid('id must be a valid uuid');
export type IdField = z.infer<typeof IdField>

export const TimestampField = z.string().datetime('timestamp field must be in iso format')
export type TimestampField = z.infer<typeof TimestampField>

export const NameField = z.string()
	.min(1, "name must be between 1 and 50 chars")
	.max(50, "name must be between 1 and 50 chars")
export type NameField = z.infer<typeof NameField>

export const DescriptionField = z.string()
	.max(200, "description must be between 1 and 200 chars")
	.optional()
export type DescriptionField = z.infer<typeof DescriptionField>

export const ColourField = z.enum(JColourVariantsList);
export type ColourField = z.infer<typeof ColourField>;

export const IconField = z.string().nullable()
export type IconField = z.infer<typeof IconField>;

export const BooleanField = z.boolean()
export type BooleanField = z.infer<typeof BooleanField>
