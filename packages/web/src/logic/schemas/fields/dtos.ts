import {z} from "zod";

import {BaseCreateDto, BaseEntityDto, BaseUpdateDto, BaseVersionDto} from "../common/dto.ts";
import {
	BooleanFieldData,
	ColourFieldData, DateFieldData,
	EmailFieldData,
	MarkdownFieldData, NumberFieldData, PhoneFieldData,
	TextLongFieldData,
	TextShortFieldData, TimestampFieldData,
	URLFieldData
} from "./types/basic.ts";
import {ReferenceManyFieldData, ReferenceOneFieldData} from "./types/references.ts";
import {SelectFieldData, SelectMultipleFieldData} from "./types/select.ts";
import {FilesFieldData, ImagesFieldData, PointFieldData, ScaleFieldData} from "./types/special.ts";

export const CreateFieldDto = z.discriminatedUnion("type", [
	// Basics
	BaseCreateDto.merge(TextShortFieldData),
	BaseCreateDto.merge(TextLongFieldData),
	BaseCreateDto.merge(MarkdownFieldData),
	BaseCreateDto.merge(URLFieldData),
	BaseCreateDto.merge(EmailFieldData),
	BaseCreateDto.merge(ColourFieldData),
	BaseCreateDto.merge(PhoneFieldData),
	BaseCreateDto.merge(BooleanFieldData),
	BaseCreateDto.merge(NumberFieldData),
	BaseCreateDto.merge(DateFieldData),
	BaseCreateDto.merge(TimestampFieldData),
	// References
	BaseCreateDto.merge(ReferenceOneFieldData),
	BaseCreateDto.merge(ReferenceManyFieldData),
	// Select
	BaseCreateDto.merge(SelectFieldData),
	BaseCreateDto.merge(SelectMultipleFieldData),
	// Special
	BaseCreateDto.merge(ScaleFieldData),
	BaseCreateDto.merge(PointFieldData),
	BaseCreateDto.merge(FilesFieldData),
	BaseCreateDto.merge(ImagesFieldData)
])
export type CreateFieldDto = z.infer<typeof CreateFieldDto>

export const UpdateFieldDto = z.discriminatedUnion("type", [
	// Basics
	BaseUpdateDto.merge(TextShortFieldData),
	BaseUpdateDto.merge(TextLongFieldData),
	BaseUpdateDto.merge(MarkdownFieldData),
	BaseUpdateDto.merge(URLFieldData),
	BaseUpdateDto.merge(EmailFieldData),
	BaseUpdateDto.merge(ColourFieldData),
	BaseUpdateDto.merge(PhoneFieldData),
	BaseUpdateDto.merge(BooleanFieldData),
	BaseUpdateDto.merge(NumberFieldData),
	BaseUpdateDto.merge(DateFieldData),
	BaseUpdateDto.merge(TimestampFieldData),
	// References
	BaseUpdateDto.merge(ReferenceOneFieldData),
	BaseUpdateDto.merge(ReferenceManyFieldData),
	// Select
	BaseUpdateDto.merge(SelectFieldData),
	BaseUpdateDto.merge(SelectMultipleFieldData),
	// Special
	BaseUpdateDto.merge(ScaleFieldData),
	BaseUpdateDto.merge(PointFieldData),
	BaseUpdateDto.merge(FilesFieldData),
	BaseUpdateDto.merge(ImagesFieldData)
])
export type UpdateFieldDto = z.infer<typeof UpdateFieldDto>

export const FieldDto = z.discriminatedUnion("type", [
	// Basics
	BaseEntityDto.merge(TextShortFieldData),
	BaseEntityDto.merge(TextLongFieldData),
	BaseEntityDto.merge(MarkdownFieldData),
	BaseEntityDto.merge(URLFieldData),
	BaseEntityDto.merge(EmailFieldData),
	BaseEntityDto.merge(ColourFieldData),
	BaseEntityDto.merge(PhoneFieldData),
	BaseEntityDto.merge(BooleanFieldData),
	BaseEntityDto.merge(NumberFieldData),
	BaseEntityDto.merge(DateFieldData),
	BaseEntityDto.merge(TimestampFieldData),
	// References
	BaseEntityDto.merge(ReferenceOneFieldData),
	BaseEntityDto.merge(ReferenceManyFieldData),
	// Select
	BaseEntityDto.merge(SelectFieldData),
	BaseEntityDto.merge(SelectMultipleFieldData),
	// Special
	BaseEntityDto.merge(ScaleFieldData),
	BaseEntityDto.merge(PointFieldData),
	BaseEntityDto.merge(FilesFieldData),
	BaseEntityDto.merge(ImagesFieldData)
])
export type FieldDto = z.infer<typeof FieldDto>

export const FieldVersionDto = z.discriminatedUnion("type", [
	// Basics
	BaseVersionDto.merge(TextShortFieldData),
	BaseVersionDto.merge(TextLongFieldData),
	BaseVersionDto.merge(MarkdownFieldData),
	BaseVersionDto.merge(URLFieldData),
	BaseVersionDto.merge(EmailFieldData),
	BaseVersionDto.merge(ColourFieldData),
	BaseVersionDto.merge(PhoneFieldData),
	BaseVersionDto.merge(BooleanFieldData),
	BaseVersionDto.merge(NumberFieldData),
	BaseVersionDto.merge(DateFieldData),
	BaseVersionDto.merge(TimestampFieldData),
	// References
	BaseVersionDto.merge(ReferenceOneFieldData),
	BaseVersionDto.merge(ReferenceManyFieldData),
	// Select
	BaseVersionDto.merge(SelectFieldData),
	BaseVersionDto.merge(SelectMultipleFieldData),
	// Special
	BaseVersionDto.merge(ScaleFieldData),
	BaseVersionDto.merge(PointFieldData),
	BaseVersionDto.merge(FilesFieldData),
	BaseVersionDto.merge(ImagesFieldData)
])
export type FieldVersionDto = z.infer<typeof FieldVersionDto>
