import {describe, test, expect} from "vitest";
import supertest from "supertest"

import {createServer} from "../src/create-server.js";
import {ConfigOverride, ConfigService} from "../src/services/config/config.service.js";
import {LoggerService} from "../src/services/logger/logger.service.js";

describe('/ [GET]', () => {
	test('root endpoint should return server info', async () => {
		const MOCK_CONFIG = {relay: {accessSecret: null, serverVersion: "test1"}} satisfies ConfigOverride
		const configService = new ConfigService(MOCK_CONFIG);
		const loggerService = new LoggerService({level: 'error'});
		const server = createServer(configService, loggerService);

		const response = await supertest(server).get("/").send()

		expect(response.statusCode).toEqual(200)
		expect(response.body).toMatchObject({
			version: "test1",
			isPublic: true,
		})
	});

	test('Given an admin secret, root endpoint should return isPublic: false', async () => {
		const MOCK_CONFIG = {relay: {accessSecret: "test1", serverVersion: "test1"}} satisfies ConfigOverride
		const configService = new ConfigService(MOCK_CONFIG);
		const loggerService = new LoggerService({level: 'error'});
		const server = createServer(configService, loggerService);

		const response = await supertest(server).get("/").send()

		expect(response.statusCode).toEqual(200)
		expect(response.body).toMatchObject({
			version: "test1",
			isPublic: false,
		})
	});
});
