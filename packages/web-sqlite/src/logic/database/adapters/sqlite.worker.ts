import sqlite3InitModule from "../../../lib/sqlite/sqlite3.mjs"
import {AdapterEvents, WorkerEvents} from "./events.ts";

const DatabaseStore = new Map<string, any>();

function sqliteFactory() {
	let sqlite

	return async () => {
		if (sqlite) {
			return sqlite
		}

		sqlite = await sqlite3InitModule()
		const opfsAvaliable = sqlite.capi.sqlite3_vfs_find("opfs")
		if (!opfsAvaliable) {
			console.error('[worker] opfs_not_available')
			self.postMessage({
				type: 'error',
				detail: {
					error: 'opfs_not_available'
				}
			})
			return
		}
		return sqlite
	}
}

(function (self: DedicatedWorkerGlobalScope) {
	console.debug('[worker] init')

	console.debug('[worker] onmessage register')
	self.onmessage = async function (messageEvent: MessageEvent<AdapterEvents>) {
		const sqlite3 = await sqliteFactory()()
		if (!sqlite3) return

		if (messageEvent.data.type === 'open') {
			const db = new sqlite3.oo1.OpfsDb({
				filename: `/headbase-v1/${messageEvent.data.detail.databaseId}.sqlite3`,
				vfs: 'multipleciphers-opfs'
			});

			try {
				db.exec({
					sql: 'select * from sqlite_master;',
					returnValue: 'resultRows'
				})
			}
			catch(e) {
				console.debug('[worker] error starting')
				console.error(e)
				return self.postMessage({
					type: messageEvent.data.type,
					targetMessageId: messageEvent.data.messageId,
					detail: {
						success: false,
						error: e
					}
				} as WorkerEvents);
			}
			DatabaseStore.set(messageEvent.data.detail.databaseId, db)

			return self.postMessage({
				type: messageEvent.data.type,
				targetMessageId: messageEvent.data.messageId,
				detail: {
					success: true
				}
			} as WorkerEvents);
		}
		else if (messageEvent.data.type === 'query') {
			console.debug('[worker] running query')
			console.debug(messageEvent.data)
			const db = DatabaseStore.get(messageEvent.data.detail.databaseId);
			if (!db) {
				return self.postMessage({
					type: messageEvent.data.type,
					targetMessageId: messageEvent.data.messageId,
					detail: {
						success: false,
						error: 'database_not_opened'
					}
				});
			}

			const result = db.exec({
				sql: messageEvent.data.detail.sql,
				bind: messageEvent.data.detail.params,
				returnValue: 'resultRows'
			})

			return self.postMessage({
				type: messageEvent.data.type,
				targetMessageId: messageEvent.data.messageId,
				detail: {
					success: true,
					result: {rows: result}
				}
			});
		}
		else if (messageEvent.data.type === 'close') {
			const db = DatabaseStore.get(messageEvent.data.detail.databaseId);
			if (!db) {
				return self.postMessage({
					type: messageEvent.data.type,
					targetMessageId: messageEvent.data.messageId,
					detail: {
						success: false,
						error: 'database_not_opened'
					}
				});
			}

			db.close()
			DatabaseStore.delete(messageEvent.data.detail.databaseId)

			return self.postMessage({
				type: messageEvent.data.type,
				targetMessageId: messageEvent.data.messageId,
				detail: {
					success: true,
				}
			});
		}
		else if (messageEvent.data.type === 'export') {
			const db = DatabaseStore.get(messageEvent.data.detail.databaseId);
			if (!db) {
				return self.postMessage({
					type: messageEvent.data.type,
					targetMessageId: messageEvent.data.messageId,
					detail: {
						success: false,
						error: 'database_not_opened'
					}
				});
			}

			const byteArray = sqlite3.capi.sqlite3_js_db_export(db);

			return self.postMessage({
				type: messageEvent.data.type,
				targetMessageId: messageEvent.data.messageId,
				detail: {
					success: true,
					database: byteArray
				}
			});
		}
		else {
			console.error(messageEvent)
			throw new Error(`Unrecognised event sent to worker`)
		}
	};

})(self as unknown as DedicatedWorkerGlobalScope);
