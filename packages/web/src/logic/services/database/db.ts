import {drizzle, SqliteRemoteDatabase} from 'drizzle-orm/sqlite-proxy';
import {sql} from "drizzle-orm";

import migration1 from "./migrations/00-setup.sql?raw"
import {DeviceContext, IDatabaseService, IEventsService} from "../interfaces.ts";
import {ErrorTypes, HeadbaseError} from "../../control-flow.ts";
import {DatabaseSchema} from "./schemas/schema.ts";
import {FieldTransactions} from "./transactions/fields.db.ts";
import {ContentTypeTransactions} from "./transactions/types.db.ts";
import {ContentItemTransactions} from "./transactions/items.db.ts";
import {ViewTransactions} from "./transactions/views.db.ts";
import {MigrationTransactions} from "./transactions/migration.db.ts";

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
	fieldsVersions: TableSnapshot
	contentTypes: TableSnapshot
	contentTypesVersions: TableSnapshot
	contentItems: TableSnapshot
	contentItemsVersions: TableSnapshot
	views: TableSnapshot
	viewsVersions: TableSnapshot
}

export interface GlobalListingOptions {
	filter?: {
		isDeleted?: boolean
	}
}


export class DatabaseTransactions {
	readonly context: DeviceContext;
	
	// todo: support concurrent database connections?
	private databaseId: string | null;
	private hasInit: boolean
	private readonly drizzleDatabase: SqliteRemoteDatabase<typeof DatabaseSchema>

	readonly fields: FieldTransactions
	readonly contentTypes: ContentTypeTransactions
	readonly contentItems: ContentItemTransactions
	readonly views: ViewTransactions
	readonly migration: MigrationTransactions

	constructor(
		config: DatabaseConfig,
		private eventsService: IEventsService,
		private databaseService: IDatabaseService,
	) {
		this.context = config.context
		this.databaseId = null
		this.hasInit = false;

		this.drizzleDatabase = drizzle(
			async (sql, params) => {
				if (!this.databaseId) {
					throw new HeadbaseError({type: ErrorTypes.NO_CURRENT_DATABASE, devMessage: "Attempted to perform transaction when database isn't open"})
				}
				return this.databaseService.exec(this.databaseId, sql, params)
			},
			(queries) => {
				throw new Error(`[database] Batch queries are not supported yet. Attempted query: ${queries}`)
			},
			{casing: 'snake_case', schema: DatabaseSchema}
		);

		this.fields = new FieldTransactions(
			{context: this.context, databaseId: this.databaseId},
			this.eventsService,
			this.drizzleDatabase
		)
		this.contentTypes = new ContentTypeTransactions(
			{context: this.context, databaseId: this.databaseId},
			this.eventsService,
			this.drizzleDatabase
		)
		this.contentItems = new ContentItemTransactions(
			{context: this.context, databaseId: this.databaseId},
			this.eventsService,
			this.drizzleDatabase
		)
		this.views = new ViewTransactions(
			{context: this.context, databaseId: this.databaseId},
			this.eventsService,
			this.drizzleDatabase
		)
		this.migration = new MigrationTransactions(
			{context: this.context, databaseId: this.databaseId},
			this.fields,
			this.contentTypes,
			this.contentItems,
			this.views,
		)
	}

	async ensureInit(): Promise<string> {
		if (!this.databaseId) {
			throw new HeadbaseError({type: ErrorTypes.NO_CURRENT_DATABASE, devMessage: "Attempted to perform transaction when database isn't open"})
		}

		if (!this.hasInit) {
			console.debug(`[database] running migrations for '${this.databaseId}'`);
			await this.drizzleDatabase.run(sql.raw(migration1))
			this.hasInit = true
		}

		return this.databaseId
	}

	async open(databaseId: string, encryptionKey: string): Promise<void> {
		const [_version, rawEncryptionKey] = encryptionKey.split('.');
		await this.databaseService.open(databaseId, rawEncryptionKey)

		this.databaseId = databaseId
		this.fields.setDatabaseId(databaseId)
		this.contentTypes.setDatabaseId(databaseId)
		this.contentItems.setDatabaseId(databaseId)
		this.views.setDatabaseId(databaseId)

		await this.ensureInit()
	}

	async close() {
		if (!this.databaseId) {
			throw new HeadbaseError({type: ErrorTypes.NO_CURRENT_DATABASE, devMessage: "Attempted to close database when nothing is open"})
		}

		await this.databaseService.close(this.databaseId)

		this.databaseId = null;
		this.fields.setDatabaseId(null)
		this.contentTypes.setDatabaseId(null)
		this.contentItems.setDatabaseId(null)
		this.views.setDatabaseId(null)

		console.debug(`[database] closed database '${this.databaseId}' from context '${this.context.id}'`)
	}
}
