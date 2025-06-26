import {
	and,
	eq,
	gt,
	gte,
	ilike,
	inArray,
	like,
	lt,
	lte,
	ne,
	notIlike,
	notInArray,
	notLike,
	or,
	sql,
	SQL
} from "drizzle-orm";
import {ErrorTypes, HeadbaseError} from "../../control-flow.ts";
import {WhereQuery} from "./types.ts";

export const ALLOWED_DOCUMENT_FIELDS = ["spec", "type", "createdAt", "createdBy", "updatedAt", "updatedBy"]
export const ALLOWED_VERSION_FIELDS = ["spec", "type", "createdAt", "createdBy"]

/**
 * Convert a JSON Path (/data/path/to/property) to the equivalent SQLite JSON Path (data->>$.path.to.property)
 */
export function convertDataJsonPath(jsonPath: string): string {
	const pathSegments = jsonPath.split("/").slice(2)
	return `data->>'$${pathSegments.map(seg => `.${seg}`)}'`
}

/**
 * Parse a WhereQuery object and return a Drizzle SQL fragment for use in a Drizzle query.
 * @param query
 * @param column
 */
export function parseWhereQuery(query: WhereQuery, column?: string): SQL | undefined {
	const conditions: (SQL|undefined)[] = []
	for (const [key, value] of Object.entries(query)) {
		if (column) {
			if (key === "$equal") {
				conditions.push(eq(sql.raw(column), value));
			}
			else if (key === "$notEqual") {
				conditions.push(ne(sql.raw(column), value));
			}
			else if (key === "$in") {
				conditions.push(inArray(sql.raw(column), value as (string|number)[]));
			}
			else if (key === "$notIn") {
				conditions.push(notInArray(sql.raw(column), value as (string|number)[]));
			}
			else if (key === "$like") {
				const likeValue = (value as string).startsWith("%") || (value as string).endsWith("%") ? value as string : `%${value}%`
				conditions.push(like(sql.raw(column), likeValue));
			}
			else if (key === "$notLike") {
				const likeValue = (value as string).startsWith("%") || (value as string).endsWith("%") ? value as string : `%${value}%`
				conditions.push(notLike(sql.raw(column), likeValue));
			}
			else if (key === "$iLike") {
				const likeValue = (value as string).startsWith("%") || (value as string).endsWith("%") ? value as string : `%${value}%`
				conditions.push(ilike(sql.raw(column), likeValue));
			}
			else if (key === "$notILike") {
				const likeValue = (value as string).startsWith("%") || (value as string).endsWith("%") ? value as string : `%${value}%`
				conditions.push(notIlike(sql.raw(column), likeValue));
			}
			else if (key === "$less") {
				conditions.push(lt(sql.raw(column), value));
			}
			else if (key === "$lessEqual") {
				conditions.push(lte(sql.raw(column), value));
			}
			else if (key === "$greater") {
				conditions.push(gt(sql.raw(column), value));
			}
			else if (key === "$greaterEqual") {
				conditions.push(gte(sql.raw(column), value));
			}
		}
		// todo: add other condition types (starts, ends, ranges)
		else if (key === "$or" && Array.isArray(value)) {
			conditions.push(or(...value.map(where => parseWhereQuery(where, column))));
		}
		else if (key === "$and" && Array.isArray(value)) {
			conditions.push(and(...value.map(where => parseWhereQuery(where, column))));
		}
		else if (ALLOWED_DOCUMENT_FIELDS.includes(key)) {
			conditions.push(parseWhereQuery(value as WhereQuery, key));
		}
		else if (key.startsWith("/data/")) {
			const sqlKey = convertDataJsonPath(key)
			console.debug(sqlKey)
			conditions.push(parseWhereQuery(value as WhereQuery, sqlKey));
		}
		else {
			throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: `Invalid condition '${key}/${value}/${column}' encountered in where query`})
		}
	}

	return and(...conditions)
}
