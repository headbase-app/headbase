import {DatabaseSnapshot} from "../db.ts";
import {DeviceContext, IDatabaseService, IEventsService} from "../../interfaces.ts";
import {EntityTransactionsConfig} from "./fields.db.ts";
import {sqlBuilder} from "./drizzle/sql-builder.ts";
import {fields, fieldsVersions} from "./drizzle/tables/fields.ts";
import {contentTypes, contentTypesVersions} from "./drizzle/tables/content-types.ts";
import {contentItems, contentItemsVersions} from "./drizzle/tables/content-items.ts";
import {views, viewsVersions} from "./drizzle/tables/views.ts";

// todo: check if entity exists before including version in snapshot?

interface DatabaseSnapshotItem {
	id: string
	is_deleted: 0 | 1
}

export class SnapshotTransactions {
	private readonly context: DeviceContext;

	constructor(
		config: EntityTransactionsConfig,
		private readonly eventsService: IEventsService,
		private readonly databaseService: IDatabaseService
	) {
		this.context = config.context
	}

	async getSnapshot(databaseId: string): Promise<DatabaseSnapshot> {
		const snapshot: DatabaseSnapshot = {
			fields: {},
			fieldsVersions: {},
			contentTypes: {},
			contentItemsVersions: {},
			contentItems: {},
			contentTypesVersions: {},
			views: {},
			viewsVersions: {}
		}

		const fieldsQuery = sqlBuilder
			.select({id: fields.id, is_deleted: fields.is_deleted})
			.from(fields)
			.toSQL()
		const fieldEntities = await this.databaseService.exec({databaseId, ...fieldsQuery, rowMode: 'object'}) as unknown as DatabaseSnapshotItem[]
		for (const entity of fieldEntities) {
			snapshot.fields[entity.id] = entity.is_deleted === 1
		}

		const fieldsVersionsQuery = sqlBuilder
			.select({id: fieldsVersions.id, is_deleted: fieldsVersions.is_deleted})
			.from(fieldsVersions)
			.toSQL()
		const fieldVersions = await this.databaseService.exec({databaseId, ...fieldsVersionsQuery, rowMode: 'object'}) as unknown as DatabaseSnapshotItem[]
		for (const version of fieldVersions) {
			snapshot.fieldsVersions[version.id] = version.is_deleted === 1
		}

		const contentTypesQuery = sqlBuilder
			.select({id: contentTypes.id, is_deleted: contentTypes.is_deleted})
			.from(contentTypes)
			.toSQL()
		const contentTypeEntities = await this.databaseService.exec({databaseId, ...contentTypesQuery, rowMode: 'object'}) as unknown as DatabaseSnapshotItem[]
		for (const entity of contentTypeEntities) {
			snapshot.contentTypes[entity.id] = entity.is_deleted === 1
		}

		const contentTypesVersionsQuery = sqlBuilder
			.select({id: contentTypesVersions.id, is_deleted: contentTypesVersions.is_deleted})
			.from(contentTypesVersions)
			.toSQL()
		const contentTypeVersions = await this.databaseService.exec({databaseId, ...contentTypesVersionsQuery, rowMode: 'object'}) as unknown as DatabaseSnapshotItem[]
		for (const version of contentTypeVersions) {
			snapshot.contentTypes[version.id] = version.is_deleted === 1
		}

		const contentItemsQuery = sqlBuilder
			.select({id: contentItems.id, is_deleted: contentItems.is_deleted})
			.from(contentItems)
			.toSQL()
		const contentItemEntities = await this.databaseService.exec({databaseId, ...contentItemsQuery, rowMode: 'object'}) as unknown as DatabaseSnapshotItem[]
		for (const entity of contentItemEntities) {
			snapshot.contentItems[entity.id] = entity.is_deleted === 1
		}

		const contentItemsVersionsQuery = sqlBuilder
			.select({id: contentItemsVersions.id, is_deleted: contentItemsVersions.is_deleted})
			.from(contentItemsVersions)
			.toSQL()
		const contentItemVersions = await this.databaseService.exec({databaseId, ...contentItemsVersionsQuery, rowMode: 'object'}) as unknown as DatabaseSnapshotItem[]
		for (const version of contentItemVersions) {
			snapshot.contentItemsVersions[version.id] = version.is_deleted === 1
		}

		const viewsQuery = sqlBuilder
			.select({id: views.id, is_deleted: views.is_deleted})
			.from(views)
			.toSQL()
		const viewsEntities = await this.databaseService.exec({databaseId, ...viewsQuery, rowMode: 'object'}) as unknown as DatabaseSnapshotItem[]
		for (const entity of viewsEntities) {
			snapshot.views[entity.id] = entity.is_deleted === 1
		}

		const viewsVersionsQuery = sqlBuilder
			.select({id: viewsVersions.id, is_deleted: viewsVersions.is_deleted})
			.from(viewsVersions)
			.toSQL()
		const viewVersions = await this.databaseService.exec({databaseId, ...viewsVersionsQuery, rowMode: 'object'}) as unknown as DatabaseSnapshotItem[]
		for (const version of viewVersions) {
			snapshot.viewsVersions[version.id] = version.is_deleted === 1
		}

		return snapshot
	}
}
