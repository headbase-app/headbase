import {DatabaseSnapshot} from "../db.ts";
import {DeviceContext, IDatabaseService, IEventsService} from "../../interfaces.ts";
import {EntityTransactionsConfig} from "./fields.db.ts";

// todo: check if entity exists before including version in snapshot?

interface SnapshotItem {
	id: string
	isDeleted: boolean
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
			contentTypesVersions: {},
			contentItems: {},
			contentItemsVersions: {},
			views: {},
			viewsVersions: {}
		}

		const fieldEntities = await this.databaseService.exec({
			databaseId,
			sql: `select e.id as id, e.is_deleted as isDeleted from fields e`,
			params: [],
			rowMode: "object"
		}) as unknown as SnapshotItem[]
		for (const entity of fieldEntities) {
			snapshot.fields[entity.id] = entity.isDeleted
		}

		const fieldVersions = await this.databaseService.exec({
			databaseId,
			sql: `select v.id as id, v.is_deleted as isDeleted from fields_versions v`,
			params: [],
			rowMode: "object"
		}) as unknown as SnapshotItem[]
		for (const version of fieldVersions) {
			snapshot.fieldsVersions[version.id] = version.isDeleted
		}

		const contentTypeEntities = await this.databaseService.exec({
			databaseId,
			sql: `select e.id as id, e.is_deleted as isDeleted from content_types e`,
			params: [],
			rowMode: "object"
		}) as unknown as SnapshotItem[]
		for (const entity of contentTypeEntities) {
			snapshot.contentTypes[entity.id] = entity.isDeleted
		}

		const contentTypeVersions = await this.databaseService.exec({
			databaseId,
			sql: `select v.id as id, v.is_deleted as isDeleted from content_types_versions v`,
			params: [],
			rowMode: "object"
		}) as unknown as SnapshotItem[]
		for (const version of contentTypeVersions) {
			snapshot.contentTypes[version.id] = version.isDeleted
		}

		const contentItemEntities = await this.databaseService.exec({
			databaseId,
			sql: `select e.id as id, e.is_deleted as isDeleted from content_items e`,
			params: [],
			rowMode: "object"
		}) as unknown as SnapshotItem[]
		for (const entity of contentItemEntities) {
			snapshot.contentItems[entity.id] = entity.isDeleted
		}

		const contentItemVersions = await this.databaseService.exec({
			databaseId,
			sql: `select v.id as id, v.is_deleted as isDeleted from content_items_versions v`,
			params: [],
			rowMode: "object"
		}) as unknown as SnapshotItem[]
		for (const version of contentItemVersions) {
			snapshot.contentItemsVersions[version.id] = version.isDeleted
		}

		const viewEntities = await this.databaseService.exec({
			databaseId,
			sql: `select e.id as id, e.is_deleted as isDeleted from views e`,
			params: [],
			rowMode: "object"
		}) as unknown as SnapshotItem[]
		for (const entity of viewEntities) {
			snapshot.views[entity.id] = entity.isDeleted
		}

		const viewVersions = await this.databaseService.exec({
			databaseId,
			sql: `select v.id as id, v.is_deleted as isDeleted from views_versions v`,
			params: [],
			rowMode: "object"
		}) as unknown as SnapshotItem[]
		for (const version of viewVersions) {
			snapshot.viewsVersions[version.id] = version.isDeleted
		}

		return snapshot
	}
}
