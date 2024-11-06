import {int, text} from "drizzle-orm/sqlite-core";

export const commonFields = {
	id: text().notNull().primaryKey(),
	createdAt: text().notNull(),
	isDeleted: int({mode: 'boolean'}).notNull(),
	hbv: text().notNull()
}

export const commonEntityFields = {
	currentVersionId: text().notNull(),
}

export const commonVersionFields = {
	entityId: text().notNull(),
	previousVersionId: text(),
	createdBy: text().notNull(),
}

export interface BaseCreateDto {
	createdBy: string
}

export interface BaseDto {
	id: string
	createdAt: string
	updatedAt: string
	isDeleted: boolean
	versionId: string
	previousVersionId: string | null
	versionCreatedBy: string
}
