import {sqliteTable, text} from "drizzle-orm/sqlite-core";
import {BaseDto, commonEntityFields, commonFields, commonVersionFields} from "./common.ts";

export const fields = sqliteTable('fields', {
	...commonFields,
	...commonEntityFields
});
export const fieldsVersion = sqliteTable('fields_versions', {
	...commonFields,
	...commonVersionFields,
	name: text().notNull(),
	colour: text()
});

export interface CreateFieldDto {
	label: string,
	description?: string,
	icon?: string,
	createdBy: string,
}

export interface UpdateFieldDto extends CreateFieldDto {}

export type TagDto = BaseDto & {
	name: string
	colour: string | null
}
