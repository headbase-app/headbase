import {drizzle, SqliteRemoteDatabase} from 'drizzle-orm/sqlite-proxy';
import {desc, eq, sql} from "drizzle-orm";
import {Observable} from "rxjs";

import migration1 from "./migrations/00-setup.sql?raw"
import {CreateTagDto, TagDto, tags, tagsVersions} from "./schema/tags";
import {WebClientAdapter} from "./adapters/web-client-adapter.ts";

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

export interface DatabaseConfig {
	databaseAdapter: typeof WebClientAdapter
}


export class Database {
	readonly #contextId: string;

	readonly #databaseId: string;
	readonly #databaseAdapter: WebClientAdapter;
	readonly #database: SqliteRemoteDatabase<typeof SCHEMA>
	#hasInit: boolean

	readonly #events: EventTarget
	readonly #broadcastChannel: BroadcastChannel

	constructor(databaseId: string, config: DatabaseConfig) {
		this.#contextId = window.crypto.randomUUID()

		this.#databaseId = databaseId;
		this.#databaseAdapter = new config.databaseAdapter({contextId: this.#contextId, databaseId: this.#databaseId})
		this.#database = drizzle(
			async (sql, params, method) => {
				console.debug(`[database] Running sql statement: ${sql}`)
				return this.#databaseAdapter.run(sql, params)
			},
			(queries) => {
				throw new Error(`[database] Batch queries are not supported yet. Attempted query: ${queries}`)
			},
			{casing: 'snake_case', schema: SCHEMA}
		);
		this.#hasInit = false;

		this.#events = new EventTarget()
		this.#broadcastChannel = new BroadcastChannel(`headbase-${this.#databaseId}`)

		this.#broadcastChannel.addEventListener('message', this.#handleBroadcastEvent.bind(this))
		console.debug(`[database] init complete for '${databaseId}' using contextId '${this.#contextId}'`)
	}

	async #ensureInit() {
		if (!this.#hasInit) {
			console.debug(`[database] running migrations for '${this.#databaseId}'`);
			await this.#database.run(sql.raw(migration1))
			this.#hasInit = true
		}
	}

	async #handleBroadcastEvent(event: MessageEvent) {
		console.debug(`[broadcast] received broadcast message:`, event.data)
		// Relay events to local event target so everywhere only has to subscribe to the single event source.
		this.#events.dispatchEvent(new CustomEvent(event.data.type, event.data.detail))
	}

	async getTags(): Promise<TagDto[]> {
		await this.#ensureInit()
		console.debug(`[database] running get tags`)

		return this.#database
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

		await this.#database.insert(tags).values({
			id: entityId,
			createdAt,
			isDeleted: false,
			hbv: HEADBASE_VERSION,
			currentVersionId: versionId
		})

		await this.#database.insert(tagsVersions).values({
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
	}

	async close() {
		console.debug(`[database] close started for database '${this.#databaseId}' from context '${this.#contextId}'`)
		this.#broadcastChannel.close()
		await this.#databaseAdapter.close()

		console.debug(`[database] closed database '${this.#databaseId}' from context '${this.#contextId}'`)
	}
}
