import {customType, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {BaseCreateDto, BaseDto, commonEntityFields, commonFields, commonVersionFields} from "../../common.ts";
import {
	BooleanSettings,
	ColourSettings, DateSettings,
	EmailSettings,
	MarkdownSettings,
	NumberSettings, PhoneSettings,
	TextLongSettings,
	TextShortSettings, TimestampSettings,
	URLSettings
} from "./types/basic.ts";
import {SelectMultipleSettings, SelectSettings} from "./types/select.ts";
import {FilesSettings, ImagesSettings, PointSettings, ScaleSettings} from "./types/special.ts";
import {ReferenceManySettings, ReferenceOneSettings} from "./types/references.ts";
import {FieldTypes} from "./types.ts";

export const fields = sqliteTable('fields', {
	...commonFields,
	...commonEntityFields,
});

export const fieldTypeColumn = customType<{data: FieldTypes}>(({
	dataType() {
		return 'text'
	}
}))

export const fieldsVersions = sqliteTable('fields_versions', {
	...commonFields,
	...commonVersionFields,
	type: fieldTypeColumn().notNull(),
	label: text().notNull(),
	description: text(),
	icon: text(),
	settings: text({ mode: 'json' }),
});

export type AllFieldTypes =
	TextShortSettings |
	TextLongSettings |
	MarkdownSettings |
	URLSettings |
	EmailSettings |
	ColourSettings |
	PhoneSettings |
	NumberSettings |
	BooleanSettings |
	TimestampSettings |
	DateSettings |
	SelectSettings |
	SelectMultipleSettings |
	ScaleSettings |
	PointSettings |
	FilesSettings |
	ImagesSettings |
	ReferenceOneSettings |
	ReferenceManySettings

export type CreateFieldDto = BaseCreateDto & {
	label: string,
	description: string | null,
	icon: string | null,
} & AllFieldTypes

// todo: prevent field type from changing in types?
export type UpdateFieldDto = CreateFieldDto

export type FieldDto = BaseDto & {
	label: string,
	description:  string | null,
	icon:  string | null,
} & AllFieldTypes
