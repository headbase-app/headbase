console.debug('[shared-worker] loaded');

(function (self: SharedWorkerGlobalScope) {
	console.debug('[shared-worker] loaded func');

	self.addEventListener("message", function (event: MessageEvent) {
		console.debug("Received message self event", event.data);
	})

	self.onconnect = function (event) {
		console.debug('[shared-worker] onconnect');
		const port = event.ports[0];

		port.start()

		port.onmessage = function (e) {
			console.debug(`[shared-worker onmedd] received message: `, e.data)

			port.postMessage('response')
		};

		port.addEventListener('message', function (e) {
			console.debug(`[shared-worker messageev] received message: `, e.data)
		})
	};

})(self as unknown as SharedWorkerGlobalScope);
