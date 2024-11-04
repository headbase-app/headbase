import {DatabaseAdapter, QueryResponse} from "./database.ts";
import sqlite3InitModule, {Sqlite3Static} from "@sqlite.org/sqlite-wasm"

export class WebDatabaseAdapter implements DatabaseAdapter {
	#sqlite3: Sqlite3Static
	#db: 

	constructor(databaseFilename: string) {
		console.debug('[sqlite] Initializing sqlite3');
		this.#sqlite3 = await sqlite3InitModule();
		if (!this.#sqlite3.opfs) {
			throw new Error("[sqlite] opfs is not available, can't create database!")
		}
		this.#db = new this.#sqlite3.oo1.OpfsDb(databaseFilename)
		console.debug(`[sqlite] Initializing complete for '${databaseFilename}'`);
	}

	async init(): Promise<void> {

	}

	async close(): Promise<void> {

	}

	async run(sql: string, params: any[]): Promise<QueryResponse> {
		return {rows: []}
	}
}
