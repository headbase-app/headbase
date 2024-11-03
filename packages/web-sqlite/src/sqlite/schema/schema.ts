import { sqliteTable, text} from 'drizzle-orm/sqlite-core';
import {commonEntityFields, commonFields, commonVersionFields, isFavouriteField} from "./common.ts";

export const fields = sqliteTable('fields', {
	...commonFields,
	...commonEntityFields,
	type: text().notNull()
});
export const fieldsVersions = sqliteTable('fields_versions', {
	...commonFields,
	...commonVersionFields,
	label: text().notNull(),
	description: text(),
	settings: text({ mode: 'json' }),
});

export const contentTypes = sqliteTable('content_types', {
	...commonFields,
	...commonEntityFields
});
export const contentTypesVersions = sqliteTable('content_types_versions', {
	...commonFields,
	...commonVersionFields,
	name: text().notNull(),
	description: text(),
	icon: text(),
	colour: text(),
	templateName: text(),
	templateTags: text({ mode: 'json' }),
	fields: text({ mode: 'json' }),
});

export const content = sqliteTable('content', {
	...commonFields,
	...commonEntityFields,
	type: text().notNull()
});
export const contentVersions = sqliteTable('content_versions', {
	...commonFields,
	...commonVersionFields,
	name: text().notNull(),
	isFavourite: isFavouriteField,
	tags: text({ mode: 'json' }),
	fields: text({ mode: 'json' })
});

export const views = sqliteTable('views', {
	...commonFields,
	...commonEntityFields,
	type: text().notNull()
});
export const viewsVersions = sqliteTable('views_versions', {
	...commonFields,
	...commonVersionFields,
	name: text().notNull(),
	description: text(),
	isFavourite: isFavouriteField,
	tags: text({ mode: 'json' }),
	fields: text({ mode: 'json' }),
});

