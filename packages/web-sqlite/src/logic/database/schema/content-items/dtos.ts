import {z} from "zod";

import {FieldStorage} from "../common/field-storage.ts";
import {BooleanField, IdField, NameField} from "../common/fields.ts";
import {BaseCreateDto, BaseEntityDto, BaseVersionDto} from "../common/dto.ts";

export const ContentItemData = z.object({
	type: IdField,
	name: NameField,
	isFavourite: BooleanField,
	fields: FieldStorage
})
export type ContentItemData = z.infer<typeof ContentItemData>

export const CreateContentItemDto = BaseCreateDto.merge(ContentItemData)
export type CreateContentItemDto = z.infer<typeof CreateContentItemDto>

export const UpdateContentItemDto = CreateContentItemDto
export type UpdateContentItemDto = CreateContentItemDto

export const ContentItemDto = BaseEntityDto.merge(ContentItemData)
export type ContentItemDto = z.infer<typeof ContentItemDto>

export const ContentItemVersionDto = BaseVersionDto.merge(ContentItemData)
export type ContentItemVersionDto = z.infer<typeof ContentItemVersionDto>
