import {sqliteTable, text} from "drizzle-orm/sqlite-core";
import {commonEntityFields, commonFields, commonVersionFields} from "./common.ts";

export const contentTypes = sqliteTable('content_types', {
	...commonFields,
	...commonEntityFields,
});

export const contentTypesVersions = sqliteTable('content_types_versions', {
	...commonFields,
	...commonVersionFields,
	name: text().notNull(),
	icon: text(),
	colour: text(),
	description: text(),
	templateName: text(),
	templateFields: text({ mode: 'json' }),
});
