import { SQLocalDrizzle } from 'sqlocal/drizzle';
import {drizzle, SqliteRemoteDatabase} from 'drizzle-orm/sqlite-proxy';
import {desc, eq, sql} from "drizzle-orm";
import {Observable} from "rxjs";

import DatabaseSharedWorker from "./shared.worker.ts?sharedworker"

import migration1 from "./migrations/00-setup.sql?raw"
import {CreateTagDto, TagDto, tags, tagsVersions} from "./schema/tags";

const HEADBASE_VERSION = '1.0'
const SCHEMA = {tags, tagsVersions}

export type LiveQuery<DataPromise> = {
		status: "loading"
	} | {
	status: "success",
	data: Awaited<DataPromise>
} | {
	status: 'error',
	error: Error
}


export class Database {
	readonly #contextId: string;

	readonly #databaseId: string;
	readonly #databaseFilename: string;
	readonly #sqLocal: SQLocalDrizzle
	readonly #db: SqliteRemoteDatabase<typeof SCHEMA>
	#hasInit: boolean

	readonly #events: EventTarget
	readonly #broadcastChannel: BroadcastChannel
	readonly #sharedWorker: SharedWorker

	readonly #databaseLockAbort: AbortController

	constructor(databaseId: string) {
		this.#contextId = window.crypto.randomUUID()

		this.#databaseId = databaseId;
		this.#databaseFilename = `headbase-${databaseId}.sqlite3`;
		this.#sqLocal = new SQLocalDrizzle(this.#databaseFilename);
		this.#db = drizzle(this.#sqLocal.driver, this.#sqLocal.batchDriver, {casing: 'snake_case', schema: SCHEMA});
		this.#hasInit = false;

		this.#events = new EventTarget()
		this.#broadcastChannel = new BroadcastChannel(`headbase-${this.#databaseId}`)

		this.#databaseLockAbort = new AbortController()
		this.#sharedWorker = new DatabaseSharedWorker()

		this.#broadcastChannel.addEventListener('message', this.#handleBroadcastEvent.bind(this))
		this.#sharedWorker.port.postMessage({type: 'database-init', detail: {contextId: this.#contextId, databaseId: this.#databaseId}})

		this.#sharedWorker.port.onmessage = async (message: MessageEvent) => {
			console.debug('[shared-worker-client] received message from shared worker: ', message.data)
			if (message.data.type === 'worker-tag-create') {
				await this.createTag(message.data.detail.createTagDto)
			}
		}

		navigator.locks.request(`headbase-${this.#databaseId}`, {signal: this.#databaseLockAbort.signal}, this.#setupDatabaseLock.bind(this))

		console.debug(`[database] init complete for '${databaseId}' using contextId '${this.#contextId}'`)
	}

	async #ensureInit() {
		if (!this.#hasInit) {
			console.debug(`[database] running migrations for '${this.#databaseId}'`);
			await this.#db.run(sql.raw(migration1))
			this.#hasInit = true
		}
	}

	async #setupDatabaseLock(lock: Lock | null) {
		console.debug(`[database] acquired lock on '${lock?.name || this.#databaseId}' using context '${this.#contextId}'`);

		this.#sharedWorker.port.postMessage({type: 'database-lock', detail: {databaseId: this.#databaseId, contextId: this.#contextId}})

		// Indefinitely maintain this lock by returning a promise.
		// When the tab or database class is closed, the lock will be released and then another context can claim the lock if required.
		return new Promise<void>((resolve) => {
			this.#databaseLockAbort.signal.addEventListener('abort', () => {
				console.debug(`[database] aborting lock '${lock?.name || this.#databaseId}' from context '${this.#contextId}'`);
				resolve()
			})
		})
	}

	async #handleBroadcastEvent(event: MessageEvent) {
		console.debug(`[broadcast] received broadcast message:`, event.data)
		// Relay events to local event target so everywhere only has to subscribe to the single event source.
		this.#events.dispatchEvent(new CustomEvent(event.data.type, event.data.detail))
	}

	async getTags(): Promise<TagDto[]> {
		await this.#ensureInit()
		console.debug(`[database] running get tags`)

		return this.#db
			.select({
				id: tags.id,
				createdAt: tags.createdAt,
				updatedAt: tagsVersions.createdAt,
				isDeleted: tags.isDeleted,
				versionId: tagsVersions.id,
				previousVersionId: tagsVersions.previousVersionId,
				versionCreatedBy: tagsVersions.createdBy,
				name: tagsVersions.createdBy,
				colour: tagsVersions.colour,
			})
			.from(tagsVersions)
			.innerJoin(tags, eq(tags.id, tagsVersions.entityId))
			.where(eq(tags.currentVersionId, tagsVersions.id))
			.orderBy(desc(tagsVersions.createdAt));
	}

	liveGetTags() {
		return new Observable<LiveQuery<ReturnType<Database['getTags']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const makeQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getTags();
				subscriber.next({status: 'success', data: results})
			}

			this.#events.addEventListener('tags-update', makeQuery)

			makeQuery()

			return () => {
				this.#events.removeEventListener('tags-update', makeQuery)
			}
		})
	}

	async createTag(createTagDto: CreateTagDto) {
		await this.#ensureInit()
		console.debug(`[database] running create tag`)

		const entityId = window.crypto.randomUUID()
		const versionId = window.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.#db.insert(tags).values({
			id: entityId,
			createdAt,
			isDeleted: false,
			hbv: HEADBASE_VERSION,
			currentVersionId: versionId
		})

		await this.#db.insert(tagsVersions).values({
			id: versionId,
			createdAt,
			isDeleted: false,
			hbv: HEADBASE_VERSION,
			entityId: entityId,
			previousVersionId: null,
			createdBy: createTagDto.createdBy,
			name: createTagDto.name,
			colour: createTagDto.colour,
		})

		this.#events.dispatchEvent(new CustomEvent('tags-update'))
		this.#broadcastChannel.postMessage({type: 'tags-update'})
		this.#sharedWorker.port.postMessage({type: 'tags-update'})
	}

	requestWorkerCreateTag(createTagDto: CreateTagDto) {
		this.#sharedWorker.port.postMessage({type: 'worker-tag-create', detail: {databaseId: this.#databaseId, createTagDto}})
	}

	async close() {
		console.debug(`[database] close started for database '${this.#databaseId}' from context '${this.#contextId}'`)
		this.#broadcastChannel.close()
		this.#sharedWorker.port.close()
		this.#databaseLockAbort.abort()
		await this.#sqLocal.destroy()

		console.debug(`[database] closed database '${this.#databaseId}' from context '${this.#contextId}'`)
	}
}