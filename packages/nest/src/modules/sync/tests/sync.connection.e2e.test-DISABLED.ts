import { describe, test, beforeAll, beforeEach, afterAll, expect, afterEach } from "@jest/globals";
import { Server } from "node:http";
import testSocket from "superwstest";
import { HttpStatus } from "@nestjs/common";

import { TestHelper } from "@testing/test-helper";
import { testUser1 } from "@testing/data/users";

let server: Server;
const testHelper = new TestHelper();
beforeAll(async () => {
	await testHelper.beforeAll();
});
afterAll(async () => {
	await testHelper.afterAll();
});
beforeEach(async () => {
	await testHelper.beforeEach();
	server = testHelper.server.listen(42100);
});
afterEach(() => {
	server.close();
});

describe("/v1/sync [WEBSOCKET]", () => {
	test("When a connection attempt is made with no ticket, it should be denied", async () => {
		await testSocket(server).ws("/v1/sync").expectConnectionError();
	});

	test("When a connection attempt is made with an invalid ticket, it should be denied", async () => {
		await testSocket(server).ws("/v1/sync", ["headbase.ticket.n38397v43uo543tbnf943vy"]).expectConnectionError();
	});

	test("When a connection attempt is made with a valid ticket, it should be accepted", async () => {
		const accessToken = await testHelper.getUserAccessToken(testUser1.id);
		const { status, body } = await testHelper.client.get("/v1/sync/ticket").set("Authorization", `Bearer ${accessToken}`).send();

		expect(status).toEqual(HttpStatus.OK);
		expect(body).toEqual(
			expect.objectContaining({
				ticket: expect.any(String),
			}),
		);

		const protocol = `headbase.ticket.${body.ticket}`;
		await testSocket(server)
			.ws("/v1/sync", [protocol])
			.set("Origin", "http://localhost:42101") // todo: flaky on hardcoded values
			.expectUpgrade((res) => {
				expect(res.headers["sec-websocket-protocol"]).toEqual(protocol);
			});
	});

	test("When client makes connection, it should receive welcome message from server", async () => {
		const accessToken = await testHelper.getUserAccessToken(testUser1.id);
		const { status, body } = await testHelper.client.get("/v1/sync/ticket").set("Authorization", `Bearer ${accessToken}`).send();

		expect(status).toEqual(HttpStatus.OK);
		expect(body).toEqual(
			expect.objectContaining({
				ticket: expect.any(String),
			}),
		);

		const protocol = `headbase.ticket.${body.ticket}`;
		await testSocket(server)
			.ws("/v1/sync", [protocol])
			.set("Origin", "http://localhost:42101") // todo: flaky on hardcoded values
			.expectJson({ type: "welcome" });
	});
});
