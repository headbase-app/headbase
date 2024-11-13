import sqlite3InitModule from "../../../lib/sqlite/sqlite3.mjs"


(function (self: DedicatedWorkerGlobalScope) {
	self.onmessage = async function (e: MessageEvent) {
		if (e.data.type === 'connect') {
			const sqlite3 = await sqlite3InitModule()

			const opfsAvaliable = sqlite3.capi.sqlite3_vfs_find("opfs")
			if (!opfsAvaliable) {
				throw new Error("OPFS is not available so can't create database")
			}

			const db = new sqlite3.oo1.OpfsDb({
				filename: `/headbase-v1/${e.data.detail.databaseId}.sqlite3`,
				vfs: 'multipleciphers-opfs'
			});

			const response = db.exec({
				sql: 'select * from sqlite_master;',
				returnValue: 'resultRows'
			});
			console.debug('DATABASE RESPONSE:')
			console.log(response)
			console.debug('====')

			self.postMessage({
				type: 'response',
				targetMessageId: e.data.messageId,
				returnValue: undefined
			});
		}
		else if (e.data.type === 'sql') {
			self.postMessage({
				type: 'response',
				targetMessageId: e.data.messageId,
				returnValue: {rows: []}
			});
		}
		else if (e.data.type === 'disconnect') {
			self.postMessage({
				type: 'response',
				targetMessageId: e.data.messageId,
				returnValue: undefined
			});
		}
		else {
			throw new Error(`Unrecognised event '${e.data.type}' sent to worker`)
		}
	};

})(self as unknown as DedicatedWorkerGlobalScope);
