import {drizzle} from "drizzle-orm/sqlite-proxy";

import { objects, objectVersions } from "./schema"

export const DatabaseSchema = { objects, objectVersions }

export const sqlBuilder = drizzle(
	async (sql, params) => {
		throw new Error(`[sql-builder] Drizzle is only used to build queries. Use .toSQL and send via DatabaseService.exec`)
	},
		(queries) => {
			throw new Error(`[sql-builder] Drizzle is only used to build queries. Use .toSQL and send via DatabaseService.exec`)
		},
		{casing: 'snake_case', schema: DatabaseSchema}
);
