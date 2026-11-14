import {describe, test, expect, beforeEach, afterEach} from "vitest";
import {Server} from "node:http";

import {
	inspectNextMessage,
	awaitSocketsClose,
	inspectMessagesForDuration,
	expectOpenForDuration, awaitSocketsOpenAndPeerListMessage
} from "./helpers/helpers.js";
import {testPeerIds} from "./helpers/data.js";
import {createServer} from "../src/create-server.js";
import {ConfigOverride, ConfigService} from "../src/services/config/config.service.js";
import {LoggerService} from "../src/services/logger/logger.service.js";

const CONNECTION_CHECK_INTERVAL = 1000
const CONNECTION_CHECK_TEST_DURATION = CONNECTION_CHECK_INTERVAL*4
const CONNECTION_CHECK_TEST_TIMEOUT = CONNECTION_CHECK_INTERVAL*6

const MOCK_CONFIG = {relay: {accessSecret: null, connectionCheckInterval: CONNECTION_CHECK_INTERVAL}} satisfies ConfigOverride
const configService = new ConfigService(MOCK_CONFIG);
const loggerService = new LoggerService({level: 'error'});

const pingMessage = JSON.stringify({kind: "health/ping"})
const pongMessage = JSON.stringify({kind: "health/pong"})

describe('Connection Checks (ping/pong)', () => {
	let server: Server

	beforeEach(() => {
		// todo: new server required for each test or final tests breaks.
		// 	Likely leak of data between tests due to reuse of stateful RelayService.
		// 	Perhaps server needs proper setup/teardown lifecycle methods.
		server = createServer(configService, loggerService);
		server.listen(42100);
	});
	afterEach(() => {
		server.close();
	});

	test('When a peer sends ping, Then server should reply with pong', async () => {
		const socket1 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.one}`)
		await awaitSocketsOpenAndPeerListMessage([socket1]);

		await inspectNextMessage(
			socket1,
			(e: MessageEvent) => {
				expect(e.data).toEqual(pongMessage)
			},
			() => {
				socket1.send(pingMessage)
			},
		)
	}, CONNECTION_CHECK_TEST_TIMEOUT);

	test('When a peer sends ping, Then server should not relay to other devices', async (ctx) => {
		const socket1 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.one}`)
		const socket2 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.two}`)
		await awaitSocketsOpenAndPeerListMessage([socket1, socket2]);

		const expectNoSocket2Messages = inspectMessagesForDuration(socket2, CONNECTION_CHECK_TEST_DURATION, (e) => {
			expect(e.data).not.toEqual(pongMessage)
		})
		const expectSocket1Message = inspectMessagesForDuration(
			socket1,
			CONNECTION_CHECK_TEST_DURATION,
			(event: MessageEvent) => {
				expect(event.data).toEqual(pongMessage)
			},
			() => {
				socket1.send(pingMessage)
			},
		)

		await Promise.all([expectSocket1Message, expectNoSocket2Messages])
	}, CONNECTION_CHECK_TEST_TIMEOUT);

	test("When peer responds to server pings, Then server should maintain the connection", async (ctx) => {
		const socket1 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.one}`);
		socket1.onmessage = (e) => {
			if (e.data === pingMessage) {
				socket1.send(pongMessage)
			}
		}
		await awaitSocketsOpenAndPeerListMessage([socket1]);
		await expectOpenForDuration(ctx, socket1, CONNECTION_CHECK_TEST_DURATION);
	}, CONNECTION_CHECK_TEST_TIMEOUT);

	test('When a peer sends pong, Then server should not relay to other devices', async () => {
		const socket1 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.one}`)
		const socket2 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.two}`)
		await awaitSocketsOpenAndPeerListMessage([socket1, socket2]);

		const expectNoPong = inspectMessagesForDuration(
			socket2,
			CONNECTION_CHECK_TEST_DURATION,
			(event: MessageEvent) => {
				expect(event.data).not.toEqual(pongMessage)
			},
			() => {
				socket1.send(pongMessage)
			}
		)

		await Promise.all([expectNoPong])
	}, CONNECTION_CHECK_TEST_TIMEOUT);

	test("When peer doesn't respond to server pings for CONNECTION_CHECK_INTERVAL, Then server should close the connection", async () => {
		const socket1 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.one}`)
		await awaitSocketsClose([socket1])
	}, CONNECTION_CHECK_TEST_TIMEOUT);

	test("When peer sends messages but not ping replies for CONNECTION_CHECK_INTERVAL, Then server should still maintain the connection", async (ctx) => {
		const socket1 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.one}`);
		await awaitSocketsOpenAndPeerListMessage([socket1]);

		const interval = setInterval(() => {
			socket1.send(JSON.stringify({kind: "msg/all", data: "test"}))
		}, CONNECTION_CHECK_INTERVAL/3)

		await expectOpenForDuration(ctx, socket1, CONNECTION_CHECK_TEST_DURATION);

		clearInterval(interval)
	}, CONNECTION_CHECK_TEST_TIMEOUT);

	test("Given multiple connected peers, When one doesn't reply to server pings, Then only that peer connection should be closed", async (ctx) => {
		const socket1 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.one}`);
		const socket2 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.two}`);
		socket2.onmessage = (e) => {
			if (e.data === pingMessage) {
				socket2.send(pongMessage)
			}
		}
		await awaitSocketsOpenAndPeerListMessage([socket1, socket2]);

		const expectSocket1Close = awaitSocketsClose([socket1]);
		const expectSocket2Open = expectOpenForDuration(ctx, socket2, CONNECTION_CHECK_TEST_DURATION);

		await Promise.all([expectSocket1Close, expectSocket2Open]);
	}, CONNECTION_CHECK_TEST_TIMEOUT*3);
});
