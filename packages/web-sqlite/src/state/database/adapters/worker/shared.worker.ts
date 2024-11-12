

(function (self: SharedWorkerGlobalScope) {

	self.onconnect = function (event) {
		const port = event.ports[0];
		console.debug(`worker connect: ${event}`)

		port.onmessage = function (e) {
			console.debug(`worker received: ${e}`)
		};
	};

})(self as unknown as SharedWorkerGlobalScope);
