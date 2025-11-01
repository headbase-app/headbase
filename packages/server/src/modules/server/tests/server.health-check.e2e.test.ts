import { describe, expect, test, beforeAll, beforeEach, afterAll } from "@jest/globals";
import { TestHelper } from "@testing/test-helper";

const testHelper = new TestHelper();
beforeAll(async () => {
	await testHelper.beforeAll();
});
afterAll(async () => {
	await testHelper.afterAll();
});
beforeEach(async () => {
	await testHelper.beforeEach();
});

describe("Server Module", () => {
	/**
	 * Health Check Route (/v1/server/health)
	 */
	describe("/v1/server/health [GET]", () => {
		test("When a request is made to a healthy server, the response should be an 'ok' health check", async () => {
			const { body, statusCode } = await testHelper.client.get("/v1/server/health");

			expect(statusCode).toEqual(200);
			expect(body).toEqual({
				status: "ok",
				services: {
					database: "ok",
					objectStore: "ok",
				},
			});
		});

		// @todo: test that server issues are reported correctly via health check
	});
});
