import {z} from "zod"
import {NameField, EntityReferenceListField, IsFavouriteField} from "../common/fields";
import { FieldStorage } from "./fields/fields";
import {EntityDto} from "../common/entities";
import {createIdField} from "@headbase-app/common";

export const ContentData = z.object({
	type: createIdField('type'),
	name: NameField,
	tags: EntityReferenceListField,
	isFavourite: IsFavouriteField,
	fields: FieldStorage
}).strict()
export type ContentData = z.infer<typeof ContentData>

export type ContentDto = EntityDto<ContentData>
