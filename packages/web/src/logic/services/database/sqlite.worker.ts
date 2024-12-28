import sqlite3InitModule, {SQLite3, SQLite3Database} from "../../../lib/sqlite/sqlite3"

import {ClientMessages, WorkerMessages} from "./messages.ts";
import {ErrorTypes} from "../../control-flow.ts";

const DatabaseStore = new Map<string, SQLite3Database>();

function getSqliteFactory() {
	let sqlite: SQLite3 | null = null;

	return async () => {
		if (sqlite) {
			return sqlite
		}

		// @ts-expect-error -- todo: sort sqlite3 types
		const newSqlite = await sqlite3InitModule()
		const opfsAvaliable = newSqlite.capi.sqlite3_vfs_find("opfs")
		if (!opfsAvaliable) {
			self.postMessage({
				type: 'error',
				detail: {
					error: 'opfs_not_available'
				}
			})

			throw Error("opfs_not_available")
		}

		sqlite = newSqlite
		return newSqlite as SQLite3
	}
}


(function (self: DedicatedWorkerGlobalScope) {
	console.debug('[worker] init')
	const getSqlite3 = getSqliteFactory()

	self.onmessage = async function (messageEvent: MessageEvent<ClientMessages>) {
		const sqlite3 = await getSqlite3()

		if (messageEvent.data.type === 'open') {
			const db = new sqlite3.oo1.DB(
				`/headbase-v1/${messageEvent.data.detail.databaseId}.sqlite3`,
				'c',
				'multipleciphers-opfs'
			);

			try {
				console.debug(`opening '${messageEvent.data.detail.databaseId}' with key '${messageEvent.data.detail.encryptionKey}'`)
				db.exec({
					sql: `PRAGMA key = 'raw:${messageEvent.data.detail.encryptionKey}';`
				})

				// Attempt to fetch from database to ensure key was accepted.
				db.exec({
					sql: 'select * from sqlite_master;',
					returnValue: 'resultRows'
				})
			}
			catch (e) {
				console.error(e)
				db.close()

				return self.postMessage({
					type: 'error',
					targetMessageId: messageEvent.data.messageId,
					detail: {
						cause: {
							type: ErrorTypes.INVALID_PASSWORD_OR_KEY,
							devMessage: 'An invalid key was supplied when attempting to open the database'
						}
					}
				} as WorkerMessages);
			}

			DatabaseStore.set(messageEvent.data.detail.databaseId, db)
			return self.postMessage({
				type: messageEvent.data.type,
				targetMessageId: messageEvent.data.messageId,
				detail: {
					success: true
				}
			} as WorkerMessages);
		}
		else if (messageEvent.data.type === 'exec') {
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
		else if (messageEvent.data.type === "delete") {
			try {
				const root = await navigator.storage.getDirectory()
				const dbFolder = await root.getDirectoryHandle('headbase-v1')
				await dbFolder.removeEntry(`${messageEvent.data.detail.databaseId}.sqlite3`)

				return self.postMessage({
					type: messageEvent.data.type,
					targetMessageId: messageEvent.data.messageId,
					detail: {
						success: true
					}
				} as WorkerMessages);
			}
			catch (e) {
				return self.postMessage({
					type: messageEvent.data.type,
					targetMessageId: messageEvent.data.messageId,
					detail: {
						success: false,
						// @todo: should be different type?
						error: e
					}
				});
			}
		}
		else {
			console.error(messageEvent)
			throw new Error(`Unrecognised event sent to worker`)
		}
	};

})(self as unknown as DedicatedWorkerGlobalScope);
