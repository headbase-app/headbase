import { SQL, sql } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

/**
 * Format a date column as an ISO 8601 string as used by Javascript.
 *
 * Ideally this would be handled by Drizzle or the underlying postgres driver, see:
 * - https://github.com/drizzle-team/drizzle-orm/issues/1757
 * - https://github.com/drizzle-team/drizzle-orm/issues/1626
 *
 * @param dateTimeColumn
 */
export function isoFormat(dateTimeColumn: PgColumn): SQL<string> {
	return sql<string>`to_char(${dateTimeColumn}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;
}
