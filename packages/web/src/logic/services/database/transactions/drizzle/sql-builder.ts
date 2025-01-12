import {drizzle} from "drizzle-orm/sqlite-proxy";

import {fields, fieldsVersions} from "./tables/fields.ts";
import {contentTypes, contentTypesVersions} from "./tables/content-types.ts";
import {contentItems, contentItemsVersions} from "./tables/content-items.ts";
import {views, viewsVersions} from "./tables/views.ts";


export const DatabaseSchema = {
	fields, fieldsHistory: fieldsVersions,
	contentTypes, contentTypesHistory: contentTypesVersions,
	contentItems, contentItemsHistory: contentItemsVersions,
	views, viewsHistory: viewsVersions
} as const

export const sqlBuilder = drizzle(
	async (sql, params) => {
		throw new Error(`[sql-builder] Drizzle is only used to build queries. Use .toSQL and send via DatabaseService.exec`)
	},
		(queries) => {
			throw new Error(`[sql-builder] Drizzle is only used to build queries. Use .toSQL and send via DatabaseService.exec`)
		},
		{casing: 'snake_case', schema: DatabaseSchema}
);
