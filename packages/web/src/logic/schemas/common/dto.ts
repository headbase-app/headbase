import {z} from "zod";
import {BooleanField, IdField, TimestampField} from "./fields.ts";


export const BaseEntityDto = z.object({
	id: IdField,
	createdAt: TimestampField,
	updatedAt: TimestampField,
	isDeleted: BooleanField,
	versionId: IdField,
	previousVersionId: IdField.nullable(),
	versionCreatedBy: z.string(),
}).strict()
export type BaseEntityDto = z.infer<typeof BaseEntityDto>

export const BaseVersionDto = z.object({
	id: IdField,
	createdAt: TimestampField,
	isDeleted: BooleanField,
	entityId: IdField,
	previousVersionId: IdField.nullable(),
	createdBy: z.string(),
}).strict()
export type BaseVersionDto = z.infer<typeof BaseEntityDto>

export const BaseCreateDto = z.object({
	id: z.string().uuid().optional(),
	createdBy: z.string(),
}).strict()
export type BaseCreateDto = z.infer<typeof BaseEntityDto>
