import {z} from "zod";
import {DescriptionField, NameField, EntityReferenceListField, IsFavouriteField} from "../common/fields";
import {EntityDto} from "../entities";

export const ORDER_BY_FIELDS = ["createdAt", "updatedAt", "name"] as const
export const OrderByFields = z.enum(ORDER_BY_FIELDS);

export const ORDER_DIRECTION = ["asc", "desc"] as const
export const OrderDirection = z.enum(ORDER_DIRECTION);

export const ViewData = z.object({
	// View Fields
	name: NameField,
	description: DescriptionField,
	tags: EntityReferenceListField,
	isFavourite: IsFavouriteField,
	// Query Fields
	queryContentTypes: EntityReferenceListField,
	queryTags: EntityReferenceListField,
	queryOrderBy: OrderByFields.optional(),
	queryOrderDirection: OrderDirection.optional()
}).strict()
export type ViewData = z.infer<typeof ViewData>

export type ViewDto = EntityDto<ViewData>
