import {
	ErrorTypes,
	HeadbaseError,
	LIVE_QUERY_LOADING_STATE,
	LiveQueryResult,
	LiveQueryStatus,
	QueryResult
} from "../../control-flow.ts";
import {Observable} from "rxjs";
import {EventMap, EventTypes} from "../events/events.ts";
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

export interface ItemsServiceConfig {
	context: DeviceContext
}

interface ConnectionStore {
	[key: string]: SqliteRemoteDatabase<typeof schema>;
}

export class HistoryService {
	private readonly config: ItemsServiceConfig
	private readonly connectionStore: ConnectionStore

	constructor(
		config: ItemsServiceConfig,
		private eventsService: EventsService,
		private keyValueStoreService: KeyValueStoreService
	) {
		this.config = config
		this.connectionStore = {}
	}

	private async getDatabase(vaultId: string): Promise<SqliteRemoteDatabase<typeof schema>> {
		if (this.connectionStore[vaultId]) return this.connectionStore[vaultId];

		const { driver, batchDriver } = new SQLocalDrizzle(`/headbase/${vaultId}/database.sqlite3`);
		this.connectionStore[vaultId] = drizzle(driver, batchDriver);

		return this.connectionStore[vaultId];
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
				previousVersionId: null,
				...createItemDto,
			})

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.config.context,
			data: {
				id,
				action: 'create',
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

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.config.context,
			data: {
				id: itemDto.id,
				action: 'create',
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

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.config.context,
			data: {
				id,
				action: 'delete',
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

			this.eventsService.subscribe(EventTypes.HISTORY_CREATE, handleEvent)
			this.eventsService.subscribe(EventTypes.HISTORY_DELETE, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.eventsService.unsubscribe(EventTypes.HISTORY_CREATE, handleEvent)
				this.eventsService.unsubscribe(EventTypes.HISTORY_DELETE, handleEvent)
			}
		})
	}
}
