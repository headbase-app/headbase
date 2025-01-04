import {fields, fieldsVersions} from "../schemas/tables/fields.ts";
import {DatabaseSnapshot} from "../db.ts";
import {DeviceContext, IEventsService} from "../../interfaces.ts";
import {SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {DatabaseSchema} from "../schemas/schema.ts";
import {contentTypes, contentTypesVersions} from "../schemas/tables/content-types.ts";
import {contentItems, contentItemsVersions} from "../schemas/tables/content-items.ts";
import {views, viewsVersions} from "../schemas/tables/views.ts";
import {EntityTransactionsConfig} from "./fields.db.ts";

// todo: check if entity exists before including version in snapshot?


export class SnapshotTransactions {
	private readonly context: DeviceContext;
	private databaseId: string | null;

	constructor(
		config: EntityTransactionsConfig,
		private readonly eventsService: IEventsService,
		private readonly drizzleDatabase: SqliteRemoteDatabase<typeof DatabaseSchema>
	) {
		this.databaseId = config.databaseId
		this.context = config.context
	}

	setDatabaseId(databaseId: string | null): void {
		this.databaseId = databaseId;
	}

	getDatabaseId(): string {
		if (!this.databaseId) {
			throw new Error("Attempted to run database query with no open database")
		}

		return this.databaseId;
	}

	async getSnapshot(): Promise<DatabaseSnapshot> {
		const snapshot: DatabaseSnapshot = {
			fields: {},
			fieldsVersions: {},
			contentTypes: {},
			contentTypesVersions: {},
			contentItems: {},
			contentItemsVersions: {},
			views: {},
			viewsVersions: {}
		}

		const fieldEntities = await this.drizzleDatabase
			.select({
				id: fields.id,
				isDeleted: fields.isDeleted,
			})
			.from(fields)
		for (const entity of fieldEntities) {
			snapshot.fields[entity.id] = entity.isDeleted
		}

		const fieldVersions = await this.drizzleDatabase
			.select({
				id: fieldsVersions.id,
				entityId: fieldsVersions.entityId,
				isDeleted: fieldsVersions.isDeleted,
			})
			.from(fieldsVersions)
		for (const version of fieldVersions) {
			snapshot.fieldsVersions[version.id] = version.isDeleted
		}

		const contentTypeEntities = await this.drizzleDatabase
			.select({
				id: contentTypes.id,
				isDeleted: contentTypes.isDeleted,
			})
			.from(contentTypes)
		for (const entity of contentTypeEntities) {
			snapshot.contentTypes[entity.id] = entity.isDeleted
		}

		const contentTypeVersions = await this.drizzleDatabase
			.select({
				id: contentTypesVersions.id,
				entityId: contentTypesVersions.entityId,
				isDeleted: contentTypesVersions.isDeleted,
			})
			.from(contentTypesVersions)
		for (const version of contentTypeVersions) {
			snapshot.contentTypes[version.id] = version.isDeleted
		}

		const contentItemEntities = await this.drizzleDatabase
			.select({
				id: contentItems.id,
				isDeleted: contentItems.isDeleted,
			})
			.from(contentItems)
		for (const entity of contentItemEntities) {
			snapshot.contentItems[entity.id] = entity.isDeleted
		}

		const contentItemVersions = await this.drizzleDatabase
			.select({
				id: contentItemsVersions.id,
				entityId: contentItemsVersions.entityId,
				isDeleted: contentItemsVersions.isDeleted,
			})
			.from(contentItemsVersions)
		for (const version of contentItemVersions) {
			snapshot.contentItemsVersions[version.id] = version.isDeleted
		}

		const viewEntities = await this.drizzleDatabase
			.select({
				id: views.id,
				isDeleted: views.isDeleted,
			})
			.from(views)
		for (const entity of viewEntities) {
			snapshot.views[entity.id] = entity.isDeleted
		}

		const viewVersions = await this.drizzleDatabase
			.select({
				id: viewsVersions.id,
				entityId: viewsVersions.entityId,
				isDeleted: viewsVersions.isDeleted,
			})
			.from(viewsVersions)
		for (const version of viewVersions) {
			snapshot.viewsVersions[version.id] = version.isDeleted
		}

		return snapshot
	}
}
