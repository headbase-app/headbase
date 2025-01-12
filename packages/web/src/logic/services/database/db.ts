import migration1 from "./migrations/00-setup.sql?raw"
import {DeviceContext, IDatabaseService, IEventsService} from "../interfaces.ts";

import {FieldTransactions} from "./transactions/fields.db.ts";
import {ContentTypeTransactions} from "./transactions/content-types.db.ts";
import {ContentItemTransactions} from "./transactions/content-items.db.ts";
import {ViewTransactions} from "./transactions/views.db.ts";
import {MigrationTransactions} from "./transactions/migration.db.ts";
import {SnapshotTransactions} from "./transactions/snapshot.db.ts";

/**
 * todo: update live queries to ensure errors are handled and passed via observers
 */

export interface DatabaseConfig {
	context: DeviceContext
}

export interface TableSnapshot {
	[id: string]: boolean
}

export interface DatabaseSnapshot {
	fields: TableSnapshot
	contentTypes: TableSnapshot
	contentItems: TableSnapshot
	views: TableSnapshot
}

export interface GlobalListingOptions {
	filter?: {
		isDeleted?: boolean
	}
}


export class DatabaseTransactions {
	readonly context: DeviceContext;

	readonly fields: FieldTransactions
	readonly contentTypes: ContentTypeTransactions
	readonly contentItems: ContentItemTransactions
	readonly views: ViewTransactions
	readonly snapshot: SnapshotTransactions
	readonly migration: MigrationTransactions

	constructor(
		config: DatabaseConfig,
		private eventsService: IEventsService,
		private databaseService: IDatabaseService,
	) {
		this.context = config.context

		this.fields = new FieldTransactions(
			{context: this.context},
			this.eventsService,
			this.databaseService
		)
		this.contentTypes = new ContentTypeTransactions(
			{context: this.context},
			this.eventsService,
			this.databaseService
		)
		this.contentItems = new ContentItemTransactions(
			{context: this.context},
			this.eventsService,
			this.databaseService
		)
		this.views = new ViewTransactions(
			{context: this.context},
			this.eventsService,
			this.databaseService
		)
		this.snapshot = new SnapshotTransactions(
			{context: this.context},
			this.eventsService,
			this.databaseService
		)
		this.migration = new MigrationTransactions(
			{context: this.context},
			this.fields,
			this.contentTypes,
			this.contentItems,
			this.views,
		)
	}

	async open(databaseId: string, encryptionKey: string): Promise<void> {
		const [_version, rawEncryptionKey] = encryptionKey.split('.');
		await this.databaseService.open(databaseId, rawEncryptionKey)

		console.debug(`[database] running migrations for '${databaseId}'`);
		await this.databaseService.exec({
			databaseId,
			sql: migration1,
			params: []
		})
		console.debug(`[database] ran migrations for '${databaseId}'`);
	}

	async close(databaseId: string) {
		// todo: check if open first?
		await this.databaseService.close(databaseId)
		console.debug(`[database] closed database '${databaseId}' from context '${this.context.id}'`)
	}

	async destroy() {
		await this.databaseService.destroy()
		// todo: close all active dbs?
	}
}
