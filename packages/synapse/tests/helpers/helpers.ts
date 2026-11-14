import { TestContext } from "vitest";
import {RelaySentMessageSchema} from "../../src/services/validation/messages.js";

/**
 * A helper function which allows the given 'test' function to be run against the next websocket message received
 * after the given 'trigger' function is ran.
 */
export async function inspectNextMessage(
	socket: WebSocket,
	test: (event: MessageEvent) => void,
	trigger?: () => void,
) {
	return new Promise<void>((resolve) => {
		const onMessage = (event: MessageEvent) => {
			socket.removeEventListener("message", onMessage)
			test(event)
			resolve()
		}
		socket.addEventListener("message", onMessage)

		trigger?.()
	})
}

/**
 * A helper function which allows the given 'test' function to be run against the next websocket message received
 * after the given 'trigger' function is ran, for the given duration (in ms).
 */
export async function inspectMessagesForDuration(
	socket: WebSocket,
	duration: number,
	test: (event: MessageEvent) => void,
	trigger?: () => void,
) {
	return new Promise<void>((resolve) => {
		const onMessage = (event: MessageEvent) => {
			socket.removeEventListener("message", onMessage)
			test(event)
		}
		socket.addEventListener("message", onMessage)

		setTimeout(() => {
			socket.removeEventListener("message", onMessage)
			resolve()
		}, duration)

		trigger?.()
	})
}

/**
 * A helper function to await the 'open' event on all given sockets.
 */
export async function awaitSocketsOpen(sockets: WebSocket[]) {
	const openPromises = sockets.map((socket) => new Promise<void>(resolve => {
		const onOpen = () => {
			socket.removeEventListener("open", onOpen);
			resolve();
		}
		socket.addEventListener("open", onOpen)
	}));

	await Promise.all(openPromises)
}

/**
 * A helper function to await the 'open' event on all given sockets AND for a peers/list message
 * which the server sends to all relay peers.
 */
export async function awaitSocketsOpenAndPeerListMessage(sockets: WebSocket[]) {
	const awaitPeerLists = sockets.map((socket) => new Promise<void>(resolve => {
		const onMessage = (e: MessageEvent) => {
			const message = JSON.parse(e.data) as RelaySentMessageSchema;
			if (message.kind === "peers/list") {
				socket.removeEventListener("message", onMessage);
				resolve();
			}
		}
		socket.addEventListener("message", onMessage)
	}));

	await Promise.all([awaitSocketsOpen(sockets), ...awaitPeerLists]);
}

/**
 * A helper function to await the 'close' event on all given sockets.
 */
export async function awaitSocketsClose(sockets: WebSocket[]) {
	const openPromises = sockets.map((socket) => new Promise<void>(resolve => {
		const onClose = () => {
			socket.removeEventListener("close", onClose);
			resolve();
		}
		socket.addEventListener("close", onClose)
	}));

	await Promise.all(openPromises)
}

/**
 * A helper function to await the 'error' event on all given sockets.
 */
export async function awaitSocketsError(sockets: WebSocket[]) {
	const openPromises = sockets.map((socket) => new Promise<void>(resolve => {
		const onError = () => {
			socket.removeEventListener("error", onError);
			resolve();
		}
		socket.addEventListener("error", onError)
	}));

	await Promise.all(openPromises)
}

/**
 * A test function which expects the given websocket to receive no messages for the given duration.
 */
export async function expectNoMessagesForDuration(ctx: TestContext, socket: WebSocket, duration: number) {
	return new Promise<void>((resolve, reject) => {
		const onMessage = (e: MessageEvent) => {
			reject()
			ctx.expect.fail(`Encountered message when none expected: ${e.data}`)
		}
		socket.addEventListener("message", onMessage)

		setTimeout(() => {
			socket.removeEventListener("message", onMessage)
			resolve()
		}, duration)
	})
}

/**
 * A test function which expects the given websocket to remain open for the given duration.
 */
export async function expectOpenForDuration(ctx: TestContext, socket: WebSocket, duration: number) {
	return new Promise<void>((resolve, reject) => {
		if (socket.readyState !== socket.OPEN) {
			reject();
			ctx.expect.fail(`Expected socket to remain open, but socket started with readyState '${socket.readyState}'`);
			return;
		}

		const timeout = setTimeout(() => {
			socket.removeEventListener("close", onClose)
			resolve()
		}, duration)

		const onClose = () => {
			clearTimeout(timeout);
			socket.removeEventListener("close", onClose);
			reject();
			ctx.expect.fail(`Expected socket to remain open but encountered close event`);
		}
		socket.addEventListener("close", onClose)
	})
}
