import {z} from "zod";
import {TimestampField} from "./fields.ts";
import {createIdField} from "@headbase-app/common";
import {HEADBASE_VERSION} from "../../headbase-web.ts";

export const EntityIdentifiers = z.object({
	id: createIdField(),
	versionId: createIdField('versionId'),
	previousVersionId: createIdField('previousVersionId').nullable(),
})
export type EntityIdentifiers = z.infer<typeof EntityIdentifiers>

export const VersionIdentifiers = z.object({
	entityId: createIdField('entityId'),
	id: createIdField(),
	previousVersionId: createIdField('previousVersionId').nullable(),
})
export type VersionIdentifiers = z.infer<typeof VersionIdentifiers>

export const MetadataFields = z.object({
	createdAt: TimestampField,
	createdBy: z.string(),
	updatedAt: TimestampField,
	updatedBy: z.string(),
	isDeleted: z.boolean(),
	hbv: z.literal(HEADBASE_VERSION),
})
export type MetadataFields = z.infer<typeof MetadataFields>

export const BaseCreateDto = z.object({
	id: createIdField().optional(),
	createdBy: MetadataFields.shape.createdBy
})
export type BaseCreateDto = z.infer<typeof BaseCreateDto>

export const BaseUpdateDto = z.object({
	updatedBy: MetadataFields.shape.updatedBy
})
export type BaseUpdateDto = z.infer<typeof BaseUpdateDto>

export const BaseEntityDto = EntityIdentifiers.merge(MetadataFields)
export type BaseEntityDto = z.infer<typeof BaseEntityDto>

export const BaseVersionDto = VersionIdentifiers.merge(MetadataFields)
export type BaseVersionDto = z.infer<typeof BaseEntityDto>
