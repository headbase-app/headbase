import {DeviceContext} from "../../interfaces.ts";
import {EntityTransactionsConfig, FieldTransactions} from "./fields.db.ts";
import {DatabaseExport} from "../../../schemas/export.ts";
import {ContentTypeTransactions} from "./types.db.ts";
import {ContentItemTransactions} from "./items.db.ts";
import {ViewTransactions} from "./views.db.ts";
import {HEADBASE_VERSION} from "../../../headbase-web.ts";
import {ErrorTypes, HeadbaseError} from "../../../control-flow.ts";
import {FieldDto} from "../../../schemas/fields/dtos.ts";
import {ContentTypeDto} from "../../../schemas/content-types/dtos.ts";
import {ContentItemDto} from "../../../schemas/content-items/dtos.ts";
import {ViewDto} from "../../../schemas/views/dtos.ts";


export class MigrationTransactions {
	private readonly context: DeviceContext;

	constructor(
		config: EntityTransactionsConfig,
		private readonly fields: FieldTransactions,
		private readonly contentTypes: ContentTypeTransactions,
		private readonly contentItems: ContentItemTransactions,
		private readonly views: ViewTransactions
	) {
		this.context = config.context
	}

	async export(): Promise<DatabaseExport> {
		const fields = await this.fields.query({filter: {isDeleted: false}});
		const contentTypes = await this.contentTypes.query({filter: {isDeleted: false}});
		const contentItems = await this.contentItems.query({filter: {isDeleted: false}});
		const views = await this.views.query({filter: {isDeleted: false}});

		return {
			exportVersion: "v1",
			hbv: HEADBASE_VERSION,
			createdAt: new Date().toISOString(),
			data: {
				fields: fields,
				contentTypes: contentTypes,
				contentItems: contentItems,
				views: views
			}
		}
	}

	async import(importData: DatabaseExport): Promise<void> {
		for (const field of importData.data.fields) {
			let existingEntity: FieldDto | null = null
			try {
				existingEntity = await this.fields.get(field.id)
			}
			catch (e) {
				if (e instanceof HeadbaseError && e.cause.type === ErrorTypes.ENTITY_NOT_FOUND) {
					console.debug(`[import] Found new field '${field.name}' (${field.id})`)
				}
				else {
					throw e
				}
			}

			if (!existingEntity) {
				await this.fields.create({
					id: field.id,
					createdBy: field.versionCreatedBy,
					type: field.type,
					name: field.name,
					icon: field.icon,
					description: field.description,
					settings: field.settings
				})
			}
			else if (existingEntity.updatedAt < field.updatedAt) {
				console.debug(`[import] Found existing field '${field.name}' (${field.id}) with older version, updating.`)

				await this.fields.update(field.id, {
					createdBy: field.versionCreatedBy,
					type: field.type,
					name: field.name,
					icon: field.icon,
					description: field.description,
					settings: field.settings
				})
			} else {
				console.debug(`[import] Found existing field '${field.name}' (${field.id}), not updating.`)
			}
		}

		for (const contentType of importData.data.contentTypes) {
			let existingEntity: ContentTypeDto | null = null
			try {
				existingEntity = await this.contentTypes.get(contentType.id)
			}
			catch (e) {
				if (e instanceof HeadbaseError && e.cause.type === ErrorTypes.ENTITY_NOT_FOUND) {
					console.debug(`[import] Found new content type '${contentType.name}' (${contentType.id})`)
				}
				else {
					throw e
				}
			}

			if (!existingEntity) {
				await this.contentTypes.create({
					id: contentType.id,
					createdBy: contentType.versionCreatedBy,
					name: contentType.name,
					description: contentType.description,
					icon: contentType.icon,
					colour: contentType.colour,
					templateName: contentType.templateName,
					templateFields: contentType.templateFields,
				})
			}
			else if (existingEntity.updatedAt < contentType.updatedAt) {
				console.debug(`[import] Found existing content type '${contentType.name}' (${contentType.id}) with older version, updating.`)

				await this.contentTypes.update(contentType.id, {
					createdBy: contentType.versionCreatedBy,
					name: contentType.name,
					description: contentType.description,
					icon: contentType.icon,
					colour: contentType.colour,
					templateName: contentType.templateName,
					templateFields: contentType.templateFields,
				})
			}
			else {
				console.debug(`[import] Found existing content type '${contentType.name}' (${contentType.id}), not updating.`)
			}
		}

		for (const contentItem of importData.data.contentItems) {
			let existingEntity: ContentItemDto | null = null
			try {
				existingEntity = await this.contentItems.get(contentItem.id)
			}
			catch (e) {
				if (e instanceof HeadbaseError && e.cause.type === ErrorTypes.ENTITY_NOT_FOUND) {
					console.debug(`[import] Found new content item '${contentItem.name}' (${contentItem.id})`)
				}
				else {
					throw e
				}
			}

			if (!existingEntity) {
				await this.contentItems.create({
					id: contentItem.id,
					createdBy: contentItem.versionCreatedBy,
					type: contentItem.type,
					name: contentItem.name,
					fields: contentItem.fields,
					isFavourite: contentItem.isFavourite,
				})
			}
			else if (existingEntity.updatedAt < contentItem.updatedAt) {
				console.debug(`[import] Found existing content item '${contentItem.name}' (${contentItem.id}) with older version, updating.`)

				await this.contentItems.update(contentItem.id, {
					createdBy: contentItem.versionCreatedBy,
					type: contentItem.type,
					name: contentItem.name,
					fields: contentItem.fields,
					isFavourite: contentItem.isFavourite,
				})
			}
			else {
				console.debug(`[import] Found existing content item '${contentItem.name}' (${contentItem.id}), not updating.`)
			}
		}

		for (const view of importData.data.views) {
			let existingEntity: ViewDto | null = null
			try {
				existingEntity = await this.views.get(view.id)
			}
			catch (e) {
				if (e instanceof HeadbaseError && e.cause.type === ErrorTypes.ENTITY_NOT_FOUND) {
					console.debug(`[import] Found new view '${view.name}' (${view.id})`)
				}
				else {
					throw e
				}
			}

			if (!existingEntity) {
				await this.views.create({
					id: view.id,
					createdBy: view.versionCreatedBy,
					type: view.type,
					name: view.name,
					isFavourite: view.isFavourite,
					settings: view.settings,
				})
			}
			else if (existingEntity.updatedAt < view.updatedAt) {
				console.debug(`[import] Found existing view '${view.name}' (${view.id}) with older version, updating.`)

				await this.views.update(view.id, {
					createdBy: view.versionCreatedBy,
					type: view.type,
					name: view.name,
					isFavourite: view.isFavourite,
					settings: view.settings,
				})
			}
			else {
				console.debug(`[import] Found existing view '${view.name}' (${view.id}), not updating.`)
			}
		}
	}
}
