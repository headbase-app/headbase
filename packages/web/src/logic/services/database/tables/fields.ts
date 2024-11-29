import {customType, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {commonEntityFields, commonFields, commonVersionFields} from "./common.ts";
import {FieldTypes} from "../../../schemas/fields/types.ts";

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
	name: text().notNull(),
	description: text(),
	icon: text(),
	settings: text({ mode: 'json' }),
});
