import sqlite3InitModule from "./jswasm/sqlite3.mjs";

(function (self: WorkerGlobalScope) {
	self.onconnect = function (event: MessageEvent) {
		const port = event.ports[0]
		console.debug('[shared-worker] connect: ', event);
	};
})(self as unknown as WorkerGlobalScope);
