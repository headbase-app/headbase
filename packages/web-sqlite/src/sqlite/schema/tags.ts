import {sqliteTable, text} from "drizzle-orm/sqlite-core";
import {BaseDto, commonEntityFields, commonFields, commonVersionFields} from "./common.ts";

export const tags = sqliteTable('tags', {
	...commonFields,
	...commonEntityFields
});
export const tagsVersions = sqliteTable('tags_versions', {
	...commonFields,
	...commonVersionFields,
	name: text().notNull(),
	colour: text()
});

export interface CreateTagDto {
	name: string,
	colour: string,
	createdBy: string,
}

export interface UpdateTagDto extends CreateTagDto {}

export type TagDto = BaseDto & {
	name: string
	colour: string | null
}
