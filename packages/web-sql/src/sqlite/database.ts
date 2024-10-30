import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm';

import migration1 from "./migrations/00-setup.sql?raw"
import {Observable} from "rxjs";

export type DatabaseStore = {
	[databaseId: string]: string
}

export class Database {
	#promiser: any
	readonly #databaseStore: DatabaseStore
	readonly #broadcastChannel: BroadcastChannel
	readonly #events: EventTarget

	constructor() {
		this.#databaseStore = {}
		this.#broadcastChannel = new BroadcastChannel('headbase-db')
		this.#events = new EventTarget()
	}

	async #getPromiser() {
		if (this.#promiser) {
			console.debug(`getPromiser hit`)
			return this.#promiser
		}

		console.debug(`getPromiser create`)
		this.#promiser = await new Promise((resolve) => {
			const _promiser = sqlite3Worker1Promiser({
				onready: () => {
					console.debug(`promiser ready`)
					resolve(_promiser);
				},
			});
		});
		const configResponse = await this.#promiser('config-get', {});
		console.log(`[sqlite] SQLite WASM loaded at version ${configResponse.result.version.libVersion}`);

		return this.#promiser
	}

	async #getDatabase(databaseId: string) {
		if (this.#databaseStore[databaseId]) {
			return this.#databaseStore[databaseId]
		}

		console.debug(`getSqliteId ${databaseId}`)

		const promiser = await this.#getPromiser()
		const dbOpenResponse = await promiser('open', {
			filename: `file:headbase-${databaseId}.sqlite3?vfs=opfs`,
		});
		const sqliteId = dbOpenResponse.dbId;
		const dbFilename = dbOpenResponse.result.filename.replace(/^file:(.*?)\?vfs=opfs$/, '$1');
		console.log(`[sqlite] OPFS available, created persisted database at ${dbFilename}`);
		this.#databaseStore[databaseId] = sqliteId

		await this.#runMigrations(sqliteId);

		return sqliteId as string
	}

	async #runMigrations(sqliteId: string) {
		console.debug(`[sqlite] running migrations`)
		const promiser = await this.#getPromiser()
		await promiser('exec', {
			dbId: sqliteId,
			sql: migration1,
		});
	}

	async query(databaseId: string, sql: string, bind?: any[]) {
		const dbId = await this.#getDatabase(databaseId);
		const promiser = await this.#getPromiser()

		console.debug(`[sqlite] running query ${sql}`)

		const result = await promiser('exec', {
			dbId,
			sql,
			bind,
			returnValue: 'resultRows',
			rowMode: 'object'
		});

		console.debug(result)

		if (sql.includes('insert into')) {
			console.debug('post message on update!')
			this.#broadcastChannel.postMessage('update')
			this.#events.dispatchEvent(new CustomEvent('update'))
		}

		return result.result.resultRows;
	}

	liveQuery(databaseId: string, sql: string, bind?: any[]) {
		return new Observable((subscriber) => {
			subscriber.next({status: 'loading'})

			const makeQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.query(databaseId, sql, bind);
				subscriber.next({status: 'success', results: results})
			}

			this.#broadcastChannel.addEventListener('message', makeQuery)
			this.#events.addEventListener('update', makeQuery)

			makeQuery()

			return () => {
				this.#broadcastChannel.removeEventListener('message', makeQuery)
				this.#events.removeEventListener('update', makeQuery)
			}
		})
	}

	async close(databaseId: string) {
		const promiser = await this.#getPromiser()
		await promiser('close', { dbId: databaseId });
	}

	async closeAll() {
		for (const databaseId of Object.keys(this.#databaseStore)) {
			await this.close(databaseId);
		}
	}
}
