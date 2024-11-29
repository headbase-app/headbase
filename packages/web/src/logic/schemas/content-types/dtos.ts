import {FieldStorage} from "../common/field-storage.ts";
import {BaseCreateDto, BaseEntityDto, BaseVersionDto} from "../common/dto.ts";
import {z} from "zod";
import {ColourField, DescriptionField, IconField, NameField} from "../common/fields.ts";

export const ContentTypeData = z.object({
	name: NameField,
	icon: IconField,
	colour: ColourField,
	description: DescriptionField,
	templateName: NameField,
	templateFields: FieldStorage
})
export type ContentTypeData = z.infer<typeof ContentTypeData>


export const CreateContentTypeDto = BaseCreateDto.merge(ContentTypeData)
export type CreateContentTypeDto = z.infer<typeof CreateContentTypeDto>

export const UpdateContentTypeDto = CreateContentTypeDto
export type UpdateContentTypeDto = CreateContentTypeDto

export const ContentTypeDto = BaseEntityDto.merge(ContentTypeData)
export type ContentTypeDto = z.infer<typeof ContentTypeDto>

export const ContentTypeVersionDto = BaseVersionDto.merge(ContentTypeData)
export type ContentTypeVersionDto = z.infer<typeof ContentTypeVersionDto>
