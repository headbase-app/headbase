import {z} from "zod";

import {TagData} from "./entities/tags";
import {FieldDefinition} from "./entities/fields/fields";
import {ContentTypeData} from "./entities/content-types";
import {ContentData} from "./entities/content";
import {ViewData} from "./entities/views";
import {LocalEntity} from "@headbase-toolkit/schemas/common/entities";


export const TableTypes = {
	tags: TagData,
	fields: FieldDefinition,
	content_types: ContentTypeData,
	content: ContentData,
	views: ViewData
}
export type TableTypes = {
	tags: TagData,
	fields: FieldDefinition,
	content_types: ContentTypeData,
	content: ContentData,
	views: ViewData
}

export type TableKeys = keyof TableTypes


export const ExposedContentTypeData = ContentTypeData.pick({fields: true, contentTemplateTags: true})
export type ExposedContentTypeData = z.infer<typeof ExposedContentTypeData>

export const ExposedContentData = ContentData.pick({type: true, tags: true, isFavourite: true})
export type ExposedContentData = z.infer<typeof ExposedContentData>

export const ExposedViewData = ViewData.pick({isFavourite: true, tags: true, queryTags: true, queryContentTypes: true})
export type ExposedViewData = z.infer<typeof ExposedViewData>

export const ExposedTableTypes = {
	tags: null,
	fields: null,
	content_types: ExposedContentTypeData,
	content: ExposedContentData,
	views: ExposedViewData,
}
export type ExposedTableTypes = {
	tags: unknown,
	fields: unknown,
	content_types: ExposedContentTypeData,
	content: ExposedContentData,
	views: ExposedViewData,
}

export type LocalEntityWithExposedFields<TableKey extends TableKeys> = LocalEntity & ExposedTableTypes[TableKey]

export type ExposedFields<TableKey extends TableKeys> = keyof ExposedTableTypes[TableKey]
