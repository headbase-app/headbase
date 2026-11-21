import sqlite3InitModule, {type Sqlite3Static} from '@sqlite.org/sqlite-wasm';
import type { OpfsDatabase } from '@sqlite.org/sqlite-wasm'

import {IMatterDriver, Matter} from "@headbase-app/matter"
import migration0 from "@headbase-app/matter/migrations/00-setup.sql?raw"

type MessageTypes = {
	mid: string
} & ({
	type: "init";
} | {
	type: "matter-proxy",
	databasePath: string,
	databaseId: string, // todo: worker should load databases by id?
	method:
		'create' |
		'update' |
		'delete' |
		'purge' |
		'get' |
		'query' |
		'_UNSAFE_raw_query' |
		'createVersion' |
		'deleteVersion' |
		'purgeVersion' |
		'getVersion' |
		'queryVersions' |
		'_UNSAFE_raw_queryVersions' |
		'clean'
	params: any[]
})


class SQLiteOPFSDriver implements IMatterDriver {
	isReady: boolean;
	db: OpfsDatabase;

	constructor(
		private sqlite3: Sqlite3Static,
		fileName: string
	) {
		if (!this.sqlite3.oo1.OpfsDb) {
			throw new Error("OPFS not supported, unable to create database.");
		}

		this.db = new this.sqlite3.oo1.OpfsDb(fileName);
		this.isReady = false;
	}

	async close() {
		this.db.close();
	}

	async init(): Promise<void> {
		// this.db.pragma('journal_mode = WAL');
		this.db.exec(migration0);
		this.isReady = true;
	}

	async query<T>(sql: string, params?: any[]): Promise<T> {
		const results = this.db.exec(sql, {bind: params, returnValue: "resultRows", rowMode: "object"})
		return results as T;
	}

	randomUUID() {
		return self.crypto.randomUUID();
	}

	async run(sql: string) {
		this.db.exec(sql)
	}

}

class HeadbaseWorker {
	databases: Map<string, Matter>
	private sqlite3?: Sqlite3Static;
	isActiveWorker: boolean = false;

	async init() {
		this.isActiveWorker = true;
	}

	constructor(private worker: DedicatedWorkerGlobalScope) {
		console.log("[worker] Headbase worker init")
		this.databases = new Map();
		this.worker.onmessage = this.handleMessage.bind(this)
	}

	async handleMessage(e: MessageEvent<MessageTypes>) {
		if (e.data.type === "init") {
			// todo: reject if already active?
			await this.init();
			this.worker.postMessage({ mid: e.data.mid, result: 'worker init completed' });
			return;
		}
		if (!this.isActiveWorker) {
			this.worker.postMessage({ mid: e.data.mid, result: new Error("Message sent to inactive worker.") });
			return;
		}

		if (e.data.type === "matter-proxy") {
			if (!this.sqlite3) {
				this.sqlite3 = await sqlite3InitModule()
			}

			const databaseId = e.data.databaseId;
			const databasePath = e.data.databasePath;
			let db = this.databases.get(databasePath);
			if (!db) {
				const driver = new SQLiteOPFSDriver(this.sqlite3, e.data.databasePath);
				db = new Matter(driver, {deletedRetentionDays: 90});
				db.events.subscribeAll((matterEvent) => {
					// todo: store BroadcastChannel alongside database connection
					const channel = new BroadcastChannel(`matter_events_${databaseId}`)
					channel.postMessage(matterEvent)
					channel.close()
				})

				this.databases.set(e.data.databasePath, db);
			}

			try {
				let result: any
				if (e.data.method === "create") {
					// @ts-ignore
					result = await db.create(...e.data.params)
				}
				else if (e.data.method === "update") {
					// @ts-ignore
					result = await db.update(...e.data.params)
				}
				else if (e.data.method === "delete") {
					// @ts-ignore
					result = await db.delete(...e.data.params)
				}
				else if (e.data.method === "purge") {
					// @ts-ignore
					result = await db.purge(...e.data.params)
				}
				else if (e.data.method === "get") {
					// @ts-ignore
					result = await db.get(...e.data.params)
				}
				else if (e.data.method === "query") {
					// @ts-ignore
					result = await db.query(...e.data.params)
				}
				else if (e.data.method === "_UNSAFE_raw_query") {
					// @ts-ignore
					result = await db._UNSAFE_raw_query(...e.data.params)
				}
				else if (e.data.method === "createVersion") {
					// @ts-ignore
					result = await db.createVersion(...e.data.params)
				}
				else if (e.data.method === "deleteVersion") {
					// @ts-ignore
					result = await db.deleteVersion(...e.data.params)
				}
				else if (e.data.method === "purgeVersion") {
					// @ts-ignore
					result = await db.purgeVersion(...e.data.params)
				}
				else if (e.data.method === "getVersion") {
					// @ts-ignore
					result = await db.getVersion(...e.data.params)
				}
				else if (e.data.method === "queryVersions") {
					// @ts-ignore
					result = await db.queryVersions(...e.data.params)
				}
				else if (e.data.method === "_UNSAFE_raw_queryVersions") {
					// @ts-ignore
					result = await db._UNSAFE_raw_queryVersions(...e.data.params)
				}
				else if (e.data.method === "clean") {
					// @ts-ignore
					result = await db.clean(...e.data.params)
				}
				else {
					result = new Error(`method "${e.data.method}" of Matter not found`)
				}

				this.worker.postMessage({ mid: e.data.mid, result });
			}
			catch (error) {
				this.worker.postMessage({ mid: e.data.mid, result: error });
			}
		}
		else {
			this.worker.postMessage(new Error("Message not recognised"));
		}
	}
}

new HeadbaseWorker(self as DedicatedWorkerGlobalScope);
