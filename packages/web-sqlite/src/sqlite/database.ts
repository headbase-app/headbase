import {drizzle, SqliteRemoteDatabase} from 'drizzle-orm/sqlite-proxy';
import {desc, eq, sql} from "drizzle-orm";
import {Observable} from "rxjs";

import migration1 from "./migrations/00-setup.sql?raw"
import {WebClientAdapter} from "./adapters/web-client-adapter.ts";
import {fieldsVersions, fields, FieldDto} from "./schema/tables/fields/fields.ts";
import {CreateFieldDto} from "./schema/tables/fields/fields.ts";


const HEADBASE_VERSION = '1.0'
const SCHEMA = {fields, fieldsVersions} as const

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
			async (sql, params) => {
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

	/**
	 * A temporary method to test the shared worker making database requests.
	 * @param createFieldDto
	 */
	async requestWorkerCreateField(createFieldDto: CreateFieldDto) {
		return this.#databaseAdapter.requestWorkerCreateField(createFieldDto)
	}

	async getFields(): Promise<FieldDto[]> {
		await this.#ensureInit()
		console.debug(`[database] running get fields`)

		return this.#database
			.select({
				id: fields.id,
				createdAt: fields.createdAt,
				updatedAt: fieldsVersions.createdAt,
				isDeleted: fields.isDeleted,
				versionId: fieldsVersions.id,
				previousVersionId: fieldsVersions.previousVersionId,
				versionCreatedBy: fieldsVersions.createdBy,
				type: fieldsVersions.type,
				label: fieldsVersions.label,
				description: fieldsVersions.description,
				icon: fieldsVersions.icon,
				settings: fieldsVersions.settings,
			})
			.from(fieldsVersions)
			.innerJoin(fields, eq(fields.id, fieldsVersions.entityId))
			.where(eq(fields.currentVersionId, fieldsVersions.id))
			.orderBy(desc(fieldsVersions.createdAt)) as unknown as FieldDto[];
	}

	liveGetFields() {
		return new Observable<LiveQuery<ReturnType<Database['getFields']>>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const makeQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getFields();
				subscriber.next({status: 'success', data: results})
			}

			this.#events.addEventListener('fields-update', makeQuery)

			makeQuery()

			return () => {
				this.#events.removeEventListener('fields-update', makeQuery)
			}
		})
	}

	async createField(createFieldDto: CreateFieldDto) {
		await this.#ensureInit()
		console.debug(`[database] running create field`)

		const entityId = window.crypto.randomUUID()
		const versionId = window.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.#database.insert(fields).values({
			id: entityId,
			createdAt,
			isDeleted: false,
			hbv: HEADBASE_VERSION,
			currentVersionId: versionId
		})

		await this.#database.insert(fieldsVersions).values({
			id: versionId,
			createdAt,
			isDeleted: false,
			hbv: HEADBASE_VERSION,
			entityId: entityId,
			previousVersionId: null,
			createdBy: createFieldDto.createdBy,
			type: createFieldDto.type,
			label: createFieldDto.label,
			description: createFieldDto.description,
			icon: createFieldDto.icon,
			settings: 'settings' in createFieldDto ? createFieldDto.settings : null,
		})

		this.#events.dispatchEvent(new CustomEvent('fields-update'))
		this.#broadcastChannel.postMessage({type: 'fields-update'})
	}

	async close() {
		console.debug(`[database] close started for database '${this.#databaseId}' from context '${this.#contextId}'`)
		this.#broadcastChannel.close()
		await this.#databaseAdapter.close()

		console.debug(`[database] closed database '${this.#databaseId}' from context '${this.#contextId}'`)
	}
}
