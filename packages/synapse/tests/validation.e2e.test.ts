import {afterEach, beforeEach, describe, test} from "vitest";
import {awaitSocketsError} from "./helpers/helpers.js";
import {testPeerIds} from "./helpers/data.js";

import {createServer} from "../src/create-server.js";
import {ConfigOverride, ConfigService} from "../src/services/config/config.service.js";
import {LoggerService} from "../src/services/logger/logger.service.js";

const MOCK_CONFIG = {relay: {accessSecret: null}} satisfies ConfigOverride
const configService = new ConfigService(MOCK_CONFIG);
const loggerService = new LoggerService({level: 'error'});

describe('Validation checks', () => {
	const server = createServer(configService, loggerService);
	beforeEach(() => {
		server.listen(42100);
	});
	afterEach(() => {
		server.close();
	});

	test('Given no peer id supplied, the socket should be closed', async () => {
		const socket1 = new WebSocket(`ws://localhost:42100/relay/relay-1`)
		await awaitSocketsError([socket1]);
		server.close();
	});

	test('Given upgrading connection on invalid url, the socket should be closed', async () => {
		const socket1 = new WebSocket(`ws://localhost:42100/invalid?pid=${testPeerIds.one}&rid=relay-1`)
		await awaitSocketsError([socket1]);
		server.close();
	});

	test('Given trailing slash in URL, the socket should be closed', async () => {
		const socket1 = new WebSocket(`ws://localhost:42100/relay/relay-1/?pid=${testPeerIds.one}`)
		await awaitSocketsError([socket1]);
		server.close();
	});
});
