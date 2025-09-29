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
import {and, eq, isNull} from "drizzle-orm";
import migration0 from "./migrations/00-setup.sql?raw"
import {featureFlags} from "../../../flags.ts";
import {joinPathParts} from "../file-system/join-path-parts.ts";

export interface FilesServiceConfig {
	context: DeviceContext
}

interface ConnectionStore {
	[key: string]: {
		db: SqliteRemoteDatabase<typeof schema>,
		destroy: () => Promise<void>
	}
}

export interface FileCache {
	paths: {
		[path: string]: Set<string>;
	},
	files: {
		[fileId: string]: {
			versions: LocalFileVersion[]
		}
	}
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

	async getFileCache(vaultId: string): Promise<FileCache> {
		const fileCache: FileCache = {
			paths: {},
			files: {}
		}

		return this._getFileCache(vaultId, null, fileCache)
	}

	async _getFileCache(vaultId: string, parentId: string | null, fileCache: FileCache): Promise<FileTree> {
		const db = await this._getDatabase(vaultId)

		await db
			.select()
			.from(filesHistory)
			.where(parentId ? eq(filesHistory.parentId, parentId) : isNull(filesHistory.parentId))
			.groupBy(filesHistory.fileId)

		for (const fileVersion of rootVersions) {
			if (!fileVersion.isDirectory) {
				const path = joinPathParts("/", fileVersion.name)
				// Ensure path and fileId exist.
				if (!fileCache.paths[path]) {
					fileCache.paths[path] = new Set()
				}
				if (!fileCache.files[fileVersion.fileId]) {
					fileCache.files[fileVersion.fileId] = {versions: []}
				}

				// Write version to path and file cache
				if (!fileCache.paths[path].has(fileVersion.fileId)) {
					fileCache.paths[path].add(fileVersion.fileId)
				}
				fileCache.files[fileVersion.fileId].versions.push(fileVersion)
			}
			else {}
		}
	}
}
