import {int, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {BaseCreateDto, BaseEntityDto, BaseVersionDto, commonEntityFields, commonFields, commonVersionFields} from "../../common.ts";

export const views = sqliteTable('views', {
	...commonFields,
	...commonEntityFields,
});

export const viewsVersions = sqliteTable('views_versions', {
	...commonFields,
	...commonVersionFields,
	type: text().notNull(),
	name: text().notNull(),
	icon: text(),
	colour: text(),
	description: text(),
	isFavorite: int({mode: 'boolean'}).notNull(),
	settings: text({ mode: 'json' }),
});

interface ViewDtoFields {
	type: string,
	name: string,
	icon: string | null,
	colour: string | null,
	description: string | null,
	isFavorite: boolean,
	// todo: define view types.
	settings: never
}

export type CreateViewDto = BaseCreateDto & ViewDtoFields

export type UpdateViewDto = CreateViewDto

export type ViewDto = BaseEntityDto & ViewDtoFields

export type ViewVersionDto = BaseVersionDto & ViewDtoFields
