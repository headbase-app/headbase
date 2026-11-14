import {describe, beforeEach, afterEach, test, expect} from "vitest";
import {Server} from "node:http";

import {
	expectNoMessagesForDuration,
	inspectMessagesForDuration,
	awaitSocketsOpenAndPeerListMessage
} from "./helpers/helpers.js";
import {testPeerIds} from "./helpers/data.js";
import {createServer} from "../src/create-server.js";
import {ConfigOverride, ConfigService} from "../src/services/config/config.service.js";
import {LoggerService} from "../src/services/logger/logger.service.js";

const CONNECTION_CHECK_INTERVAL = 1000
const CONNECTION_CHECK_TEST_DURATION = CONNECTION_CHECK_INTERVAL*4
const CONNECTION_CHECK_TEST_TIMEOUT = CONNECTION_CHECK_INTERVAL*6

const MOCK_CONFIG = {relay: {accessSecret: null}} satisfies ConfigOverride
const configService = new ConfigService(MOCK_CONFIG);
const loggerService = new LoggerService({level: 'error'});

const testMessage = {kind: "msg/all", data: "test"}

describe('Relaying messages', () => {
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

	test('Two sockets can connect and relay messages', async () => {
		const socket1 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.one}`)
		const socket2 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.two}`)
		await awaitSocketsOpenAndPeerListMessage([socket1, socket2]);

		await inspectMessagesForDuration(
			socket2,
			CONNECTION_CHECK_TEST_DURATION,
			(event: MessageEvent) => {
				const jsonEventData = JSON.parse(event.data);
				expect(jsonEventData).toBeOneOf([
					{
						kind: "health/ping"
					},
					{
						...testMessage,
						from: testPeerIds.one
					}
				])
			},
			() => {
				socket1.send(JSON.stringify(testMessage))
			},
		)
	}, CONNECTION_CHECK_TEST_TIMEOUT);

	test('Messages should not be relayed back to sender', async (ctx) => {
		const socket1 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.one}`)
		const socket2 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.two}`)
		await awaitSocketsOpenAndPeerListMessage([socket1, socket2]);

		const expectNoSocket1Messages = expectNoMessagesForDuration(ctx, socket1, 1000)
		const expectSocket2Message = inspectMessagesForDuration(
			socket2,
			CONNECTION_CHECK_TEST_DURATION,
			(event: MessageEvent) => {
				const jsonEventData = JSON.parse(event.data);
				expect(jsonEventData).toBeOneOf([
					{
						kind: "health/ping"
					},
					{
						...testMessage,
						from: testPeerIds.one
					}
				])
			},
			() => {
				socket1.send(JSON.stringify(testMessage))
			},
		)

		await Promise.all([expectNoSocket1Messages, expectSocket2Message])
	}, CONNECTION_CHECK_TEST_TIMEOUT);

	test('Messages should not leak between relays', async (ctx) => {
		const relay1socket1 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.one}`)
		const relay1socket2 = new WebSocket(`ws://localhost:42100/relay/relay-1?pid=${testPeerIds.two}`)
		const relay2socket1 = new WebSocket(`ws://localhost:42100/relay/relay-2?pid=${testPeerIds.three}`)

		// Connection should trigger peers/list messages, so wait for those first too.
		await awaitSocketsOpenAndPeerListMessage([relay1socket1, relay1socket2, relay2socket1]);

		const expectNoMessages1 = expectNoMessagesForDuration(ctx, relay2socket1, 1000)

		const expectSocket1Message = inspectMessagesForDuration(
			relay1socket1,
			CONNECTION_CHECK_TEST_DURATION,
			(event: MessageEvent) => {
				const eventJsonData = JSON.parse(event.data);
				expect(eventJsonData).toBeOneOf([
					{
						kind: "health/ping"
					},
					{
						...testMessage,
						from: testPeerIds.two
					}
				])
			},
			() => {
				relay1socket2.send(JSON.stringify(testMessage))
			},
		)

		await Promise.all([
			expectNoMessages1,
			expectSocket1Message,
		]);
	}, CONNECTION_CHECK_TEST_TIMEOUT);
});
