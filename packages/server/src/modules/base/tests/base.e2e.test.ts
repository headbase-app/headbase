import { describe, expect, test, beforeAll, beforeEach, afterAll } from "vitest";
import { TestHelper } from "@testing/test-helper.js";

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

describe("Base Module", () => {
	/**
	 * Base Route (/)
	 */
	describe("/ [GET]", () => {
		test("When a request is made, the response should be a string message", async () => {
			const { body, statusCode } = await testHelper.client.get("/");

			expect(statusCode).toEqual(200);
			expect(body).toEqual(
				expect.objectContaining({
					message: expect.any(String),
				}),
			);
		});

		// When a request is made without authorization, Then the responses should still succeed
		// This is naturally tested as part of the above data.
	});

	/**
	 * Base V1 Route (/v1)
	 */
	describe("/v1 [GET]", () => {
		test("When a request is made, the response should be a string message", async () => {
			const { body, statusCode } = await testHelper.client.get("/");

			expect(statusCode).toEqual(200);
			expect(body).toEqual(
				expect.objectContaining({
					message: expect.any(String),
				}),
			);
		});

		// When a request is made without authorization, Then the responses should still succeed
		// This is naturally tested as part of the above data.
	});
});
