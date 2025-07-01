import {
	ErrorTypes,
	HeadbaseError,
	LIVE_QUERY_LOADING_STATE,
	LiveQueryResult,
	LiveQueryStatus,
} from "../../control-flow.ts";
import {Observable} from "rxjs";
import {EventMap, EventTypes} from "../events/events.ts";
import {EncryptionService} from "../encryption/encryption.ts"
import {EventsService} from "../events/events.service.ts";
import {SQLocalDrizzle} from "sqlocal/drizzle";
import {drizzle, SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {DeviceContext} from "../../interfaces.ts";
import {schema, filesHistory, LocalFileVersion} from "./schema.ts"
import {and, eq} from "drizzle-orm";
import migration0 from "./migrations/00-setup.sql?raw"
import {featureFlags} from "../../../flags.ts";
export interface FilesServiceConfig {
	context: DeviceContext
}

interface ConnectionStore {
	[key: string]: {
		db: SqliteRemoteDatabase<typeof schema>,
		destroy: () => Promise<void>
	}
}

export type FileTree = {
	name: string
	isDirectory: false
	fileId: string
} | {
	name: string
	isDirectory: true
	fileId: string
	children: FileTree[]
}


export interface QueryOptions {
	parentId?: string | null
}

export class FilesService {
	private readonly config: FilesServiceConfig
	readonly connectionStore: ConnectionStore

	constructor(
		config: FilesServiceConfig,
		private events: EventsService
	) {
		this.config = config
		this.connectionStore = {}
	}

	async destroy() {
		for (const connection of Object.values(this.connectionStore)) {
			await connection.destroy()
		}
	}

	async _getDatabase(vaultId: string): Promise<SqliteRemoteDatabase<typeof schema>> {
		if (this.connectionStore[vaultId]) {
			return this.connectionStore[vaultId].db;
		}

		const { driver, batchDriver, destroy } = new SQLocalDrizzle({
			databasePath: `/headbase/dbs/${vaultId}.sqlite3`,
			verbose: featureFlags().debug_sqlite
		});
		this.connectionStore[vaultId] = {
			db: drizzle(driver, batchDriver, {casing: "snake_case"}),
			destroy,
		}
		await this.connectionStore[vaultId].db.run(migration0)

		return this.connectionStore[vaultId].db;
	}

	/**
	 * Get a single file version.
	 *
	 * @param vaultId
	 * @param id
	 */
	async get(vaultId: string, id: string): Promise<LocalFileVersion> {
		const db = await this._getDatabase(vaultId)
		const result = await db
			.select()
			.from(filesHistory)
			.where(eq(filesHistory.id, id))

		if (!result[0]) {
			throw new HeadbaseError({type: ErrorTypes.NOT_FOUND, devMessage: `file version ${id} not found`})
		}

		return result[0]
	}

	/**
	 * Create a new file version.
	 *
	 * @param vaultId
	 * @param fileVersion
	 */
	async create(vaultId: string, fileVersion: LocalFileVersion): Promise<string> {
		const db = await this._getDatabase(vaultId)

		const id = EncryptionService.generateUUID();
		await db.insert(filesHistory).values(fileVersion)
		this.events.dispatch(EventTypes.HISTORY_CHANGE, {
			context: this.config.context,
			data: {
				vaultId,
				action: 'save',
				id: id,
				versionId: id,
			}
		})

		return id
	}

	/**
	 * Delete the given file version.
	 */
	async delete(vaultId: string, id: string): Promise<void> {
		const db = await this._getDatabase(vaultId)

		// Allows error to be thrown on none existing version.
		await this.get(vaultId, id)

		const deletedAt = new Date().toISOString()
		await db
			.update(filesHistory)
			.set({deletedAt})
			.where(eq(filesHistory.id, id))

		this.events.dispatch(EventTypes.HISTORY_CHANGE, {
			context: this.config.context,
			data: {
				vaultId,
				id: id,
				versionId: id,
				action: 'delete-version'
			}
		})
	}

	/**
	 * Delete all versions for the given file.
	 */
	async deleteFile(vaultId: string, fileId: string): Promise<void> {
		const db = await this._getDatabase(vaultId)

		const deletedAt = new Date().toISOString()
		await db
			.update(filesHistory)
			.set({deletedAt})
			.where(eq(filesHistory.fileId, fileId))

		// todo: delete any children of deleting a folder?

		this.events.dispatch(EventTypes.HISTORY_CHANGE, {
			context: this.config.context,
			data: {
				vaultId,
				id: fileId,
				versionId: fileId,
				action: 'delete-file'
			}
		})
	}

	/**
	 * Query for files.
	 */
	async query(vaultId: string, query?: QueryOptions): Promise<LocalFileVersion[]> {
		const db = await this._getDatabase(vaultId)

		const where = typeof query?.parentId !== 'undefined'
			? and(eq(filesHistory.parentId, query.parentId))
			: undefined

		return await db.query.filesHistory.findMany({where})
	}

	liveQuery(vaultId: string) {
		return new Observable<LiveQueryResult<LocalFileVersion[]>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				subscriber.next(LIVE_QUERY_LOADING_STATE)

				try {
					const results = await this.query(vaultId)
					subscriber.next({status: LiveQueryStatus.SUCCESS, result: results})
				}
				catch (e) {
					subscriber.next({status: LiveQueryStatus.ERROR, errors: [e]})
				}
			}

			const handleEvent = (e: EventMap["history-change"]) => {
				// todo: change based on query and results.
				if (e.detail.data.vaultId === vaultId) {
					runQuery()
				}
			}

			this.events.subscribe(EventTypes.HISTORY_CHANGE, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.events.unsubscribe(EventTypes.HISTORY_CHANGE, handleEvent)
			}
		})
	}

	async getFileTree(vaultId: string): Promise<FileTree> {
		return this._getFileTree(vaultId, null)
	}

	async _getFileTree(vaultId: string, parentId: string | null): Promise<FileTree> {
		const tree: FileTree = {
			name: '/',
			fileId: '',
			isDirectory: true,
			children: []
		}
		const children = await this.query(vaultId, {parentId})

		for (const file of children) {
			if (!file.isDirectory) {
				tree.children.push({name: file.name, fileId: file.fileId, isDirectory: file.isDirectory})
			}
			else {
				const childTree = await this._getFileTree(vaultId, file.fileId)
				tree.children.push(childTree)
			}
		}

		return tree
	}
}
