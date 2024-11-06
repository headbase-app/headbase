import type {AdapterOptions, DatabaseAdapter, QueryResponse} from "./adapter.d.ts";
import { SQLocal } from 'sqlocal';


export class WebClientAdapter implements DatabaseAdapter {
	readonly #contextId: string
	readonly #databaseId: string
	readonly #databaseFilename: string
	readonly #db: SQLocal
	readonly #databaseLockAbort: AbortController

	constructor(options: AdapterOptions) {
		this.#contextId = options.contextId
		this.#databaseId = options.databaseId
		this.#databaseFilename = `headbase-${this.#databaseId}.sqlite3`;
		this.#db = new SQLocal(this.#databaseFilename);

		this.#databaseLockAbort = new AbortController()
		navigator.locks.request(`headbase-${this.#databaseId}`, {signal: this.#databaseLockAbort.signal}, this.#setupDatabaseLock.bind(this))
	}

	async #setupDatabaseLock(lock: Lock | null) {
		console.debug(`[database] acquired lock on '${lock?.name || this.#databaseId}' using context '${this.#contextId}'`);

		// Indefinitely maintain this lock by returning a promise.
		// When the tab or database class is closed, the lock will be released and then another context can claim the lock if required.
		return new Promise<void>((resolve) => {
			this.#databaseLockAbort.signal.addEventListener('abort', () => {
				console.debug(`[database] aborting lock '${lock?.name || this.#databaseId}' from context '${this.#contextId}'`);
				resolve()
			})
		})
	}

	async close(): Promise<void> {
		await this.#db.destroy()
		this.#databaseLockAbort.abort()
	}

	async run(sql: string, params: any[]): Promise<QueryResponse> {
		// @ts-expect-error -- This method is not exposed from sqlocal, but we
		return this.#db.exec(sql, params)
	}
}
