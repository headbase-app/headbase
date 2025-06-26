import {
	ErrorTypes,
	HeadbaseError,
	LIVE_QUERY_LOADING_STATE,
	LiveQueryResult,
	LiveQueryStatus,
	QueryResult
} from "../../control-flow.ts";
import {Observable} from "rxjs";
import {EventMap, EventTypes, HeadbaseEvent} from "../events/events.ts";
import {EncryptionService} from "../encryption/encryption.ts"
import {EventsService} from "../events/events.service.ts";
import {SQLocalDrizzle} from "sqlocal/drizzle";
import {drizzle, SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {DeviceContext} from "../../interfaces.ts";
import {KeyValueStoreService} from "../key-value-store/key-value-store.service.ts";
import {schema, history} from "./schema.ts"
import {eq} from "drizzle-orm";
import { CreateHistoryItemDto } from "@headbase-app/common"
import {LocalHistoryItemDto} from "./local-history-item.ts";
import migration0 from "./migrations/00-setup.sql?raw"
import {featureFlags} from "../../../flags.ts";

export interface ItemsServiceConfig {
	context: DeviceContext
}

interface ConnectionStore {
	[key: string]: {
		db: SqliteRemoteDatabase<typeof schema>,
		destroy: () => Promise<void>
	}
}

export class HistoryService {
	private readonly config: ItemsServiceConfig
	readonly connectionStore: ConnectionStore
	_handleEventBound: (event: HeadbaseEvent) => Promise<void>

	constructor(
		config: ItemsServiceConfig,
		private events: EventsService,
		private keyValueStoreService: KeyValueStoreService
	) {
		this.config = config
		this.connectionStore = {}

		this._handleEventBound = this.handleEvent.bind(this)
		this.events.subscribeAll(this._handleEventBound)
	}

	async destroy() {
		console.debug('[sync] ending sync service');
		this.events.unsubscribeAll(this._handleEventBound)

		for (const connection of Object.values(this.connectionStore)) {
			await connection.destroy()
		}
	}

	async handleEvent(event: HeadbaseEvent) {
		if (event.type === EventTypes.FILE_SYSTEM_CHANGE) {
			if (event.detail.data.action === 'save') {
				const contentHash = await EncryptionService.hash(event.detail.data.content)

				await this.create(
					event.detail.data.vaultId,
					{
						// todo: pull type from path or event?
						type: ".md",
						path: event.detail.data.path,
						device: this.config.context.name || this.config.context.id,
						contentHash,
						content: event.detail.data.content,
					}
				)
			}
		}
	}

	private async getDatabase(vaultId: string): Promise<SqliteRemoteDatabase<typeof schema>> {
		if (this.connectionStore[vaultId]) {
			return this.connectionStore[vaultId].db;
		}

		const { driver, batchDriver, destroy } = new SQLocalDrizzle({
			databasePath: `/headbase/${vaultId}/database.sqlite3`,
			verbose: featureFlags().debug_sqlite
		});
		this.connectionStore[vaultId] = {
			db: drizzle(driver, batchDriver, {casing: "snake_case"}),
			destroy,
		}

		console.debug(migration0)
		await this.connectionStore[vaultId].db.run(migration0)

		return this.connectionStore[vaultId].db;
	}

	/**
	 * Get a single item.
	 *
	 * @param vaultId
	 * @param id
	 */
	async get(vaultId: string, id: string): Promise<LocalHistoryItemDto> {
		const db = await this.getDatabase(vaultId)
		const result = await db
			.select()
			.from(history)
			.where(eq(history.id, id))

		if (!result[0]) {
			throw new HeadbaseError({type: ErrorTypes.NOT_FOUND, devMessage: `version ${id} not found`})
		}

		return result[0]
	}

	/**
	 * Create a new item.
	 *
	 * @param vaultId
	 * @param createItemDto
	 */
	async create(vaultId: string, createItemDto: CreateHistoryItemDto): Promise<string> {
		const db = await this.getDatabase(vaultId)

		const id = EncryptionService.generateUUID();
		const timestamp = new Date().toISOString();

		await db
			.insert(history)
			.values({
				id: id,
				createdAt: timestamp,
				deletedAt: null,
				previousVersionId: null, //todo: allow to be set
				...createItemDto,
			})

		// todo: use return from insert
		const item = await this.get(vaultId, id)

		this.events.dispatch(EventTypes.HISTORY_CREATE, {
			context: this.config.context,
			data: {
				vaultId,
				item,
			}
		})

		return id
	}

	/**
	 * Insert an existing item (for example, when downloading from server)
	 *
	 * @param vaultId
	 * @param itemDto
	 */
	async insertExisting(vaultId: string, itemDto: LocalHistoryItemDto): Promise<string> {
		const db = await this.getDatabase(vaultId)

		await db
			.insert(history)
			.values(itemDto)

		this.events.dispatch(EventTypes.HISTORY_CREATE, {
			context: this.config.context,
			data: {
				vaultId,
				item: itemDto,
			}
		})

		return itemDto.id
	}

	/**
	 * Delete the given item.
	 */
	async delete(vaultId: string, id: string): Promise<void> {
		// No need to actually access the item, but check it does exist.
		await this.get(vaultId, id)

		const db = await this.getDatabase(vaultId)
		await db
			.delete(history)
			.where(eq(history.id, id))

		this.events.dispatch(EventTypes.HISTORY_DELETE, {
			context: this.config.context,
			data: {
				vaultId,
				id
			}
		})
	}

	/**
	 * Query for items.
	 */
	async query(vaultId: string): Promise<QueryResult<LocalHistoryItemDto[]>> {
		const db = await this.getDatabase(vaultId)

		const results = await db
			.select()
			.from(history)

		return {
			result: results,
		}
	}

	liveQuery(vaultId: string) {
		return new Observable<LiveQueryResult<LocalHistoryItemDto[]>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				subscriber.next(LIVE_QUERY_LOADING_STATE)

				try {
					const query = await this.query(vaultId)
					subscriber.next({status: LiveQueryStatus.SUCCESS, result: query.result, errors: query.errors})
				}
				catch (e) {
					subscriber.next({status: LiveQueryStatus.ERROR, errors: [e]})
				}
			}

			const handleEvent = (e: EventMap["history-create"]|EventMap["history-delete"]) => {
				if (e.detail.data.vaultId === vaultId) {
					runQuery()
				}
			}

			this.events.subscribe(EventTypes.HISTORY_CREATE, handleEvent)
			this.events.subscribe(EventTypes.HISTORY_DELETE, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.events.unsubscribe(EventTypes.HISTORY_CREATE, handleEvent)
				this.events.unsubscribe(EventTypes.HISTORY_DELETE, handleEvent)
			}
		})
	}
}
