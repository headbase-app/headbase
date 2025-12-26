import {sqliteTable, text, customType} from "drizzle-orm/sqlite-core";
import {sql} from "drizzle-orm";
import type {ObjectFields} from "./types.ts";

/**
 * A custom "blob" field providing types and correct driver value conversions.
 *
 * Drizzle assumes a global "Buffer" implementation is available for blob fields, so toDriver/fromDriver is overwritten
 * to stop this causing issues in environments like browsers where Buffer isn't available.
 */
const typedBlob = customType<{ data: ArrayBuffer }>({
	dataType() {
		return 'blob';
	},
	toDriver(value) {
		return value
	},
	fromDriver(value) {
		// todo: need converting from Uint8Array to ArrayBuffer?
		return value as ArrayBuffer
	}
});

const typedFields = customType<{ data: ObjectFields }>({
	dataType() {
		return 'text';
	},
	toDriver(value) {
		return JSON.stringify(value)
	},
	fromDriver(value) {
		return JSON.parse(value as string)
	},
});

export const objectsTable = sqliteTable("objects", {
	// Spec/Type Information
	spec: text().notNull(),
	type: text().notNull(),
	// Identifiers
	id: text().primaryKey(),
	versionId: text().notNull(),
	previousVersionId: text(),
	// Metadata
	createdAt: text().default(sql`strftime('%FT%R:%fZ'`).notNull(),
	createdBy: text().notNull(),
	updatedAt: text().default(sql`strftime('%FT%R:%fZ'`).notNull(),
	updatedBy: text().notNull(),
	// Data
	fields: typedFields({ mode: 'json' }).notNull(),
	blob: typedBlob()
});

export const historyTable = sqliteTable("history", {
	// Spec/Type Information
	spec: text().notNull(),
	type: text().notNull(),
	// Identifiers
	objectId: text().notNull(),
	id: text().primaryKey(),
	previousVersionId: text(),
	// Metadata
	createdAt: text().default(sql`strftime('%FT%R:%fZ'`).notNull(),
	createdBy: text().notNull(),
	updatedAt: text().default(sql`strftime('%FT%R:%fZ'`).notNull(),
	updatedBy: text().notNull(),
	deletedAt: text().default(sql`strftime('%FT%R:%fZ'`),
	deletedBy: text(),
	// Data
	fields: typedFields({ mode: 'json' }).notNull(),
	blob: typedBlob()
});

export const DatabaseSchema = { objectsTable, historyTable }
export type DatabaseSchema = typeof DatabaseSchema
