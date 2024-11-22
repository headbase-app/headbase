import {BaseCreateDto, BaseEntityDto, BaseVersionDto} from "../../common.ts";
import {AllFieldSettings, FieldDtoFields} from "./schema/schema.ts";

export type CreateFieldDto = BaseCreateDto & FieldDtoFields & AllFieldSettings

// todo: prevent field type from changing in types?
export type UpdateFieldDto = CreateFieldDto

export type FieldDto = BaseEntityDto & FieldDtoFields & AllFieldSettings

export type FieldVersionDto = BaseVersionDto & FieldDtoFields & AllFieldSettings
