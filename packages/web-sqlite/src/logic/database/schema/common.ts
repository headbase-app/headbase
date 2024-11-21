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

export interface BaseEntityDto {
	id: string
	createdAt: string
	updatedAt: string
	isDeleted: boolean
	versionId: string
	previousVersionId: string | null
	versionCreatedBy: string
}

export interface BaseVersionDto {
	id: string
	createdAt: string
	isDeleted: boolean
	entityId: string
	previousVersionId: string | null
	createdBy: string
}
