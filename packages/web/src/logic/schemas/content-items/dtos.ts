import {z} from "zod";

import {FieldStorage} from "../common/field-storage.ts";
import {NameField} from "../common/fields.ts";
import {createIdField} from "@headbase-app/common";
import {BaseCreateDto, BaseEntityDto, BaseUpdateDto, BaseVersionDto} from "../common/dto.ts";

export const ContentItemData = z.object({
	type: createIdField('type'),
	name: NameField,
	isFavourite: z.boolean(),
	fields: FieldStorage
})
export type ContentItemData = z.infer<typeof ContentItemData>

export const CreateContentItemDto = BaseCreateDto.merge(ContentItemData)
export type CreateContentItemDto = z.infer<typeof CreateContentItemDto>

export const UpdateContentItemDto = BaseUpdateDto.merge(ContentItemData)
export type UpdateContentItemDto = z.infer<typeof UpdateContentItemDto>

export const ContentItemDto = BaseEntityDto.merge(ContentItemData)
export type ContentItemDto = z.infer<typeof ContentItemDto>

export const ContentItemVersionDto = BaseVersionDto.merge(ContentItemData)
export type ContentItemVersionDto = z.infer<typeof ContentItemVersionDto>
