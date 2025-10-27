import { test, describe, afterAll, beforeAll, beforeEach, expect } from "vitest";

import { TestHelper } from "@testing/test-helper";
import { testAdminUser1, testUser1 } from "@testing/data/users";
import { expectForbidden } from "@testing/common/expect-forbidden";
import { expectUnauthorized } from "@testing/common/expect-unauthorized";

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

describe("Get Settings - /v1/server/settings [GET]", () => {
	// Testing success cases/happy paths work.
	describe("Success Cases", () => {
		test("When authorized as admin, the server settings should be returned", async () => {
			const accessToken = await testHelper.getUserAccessToken(testAdminUser1.id);

			const { body, statusCode } = await testHelper.client.get("/v1/server/settings").set("Authorization", `Bearer ${accessToken}`).send();

			expect(statusCode).toEqual(200);
			expect(body).toEqual(
				expect.objectContaining({
					registrationEnabled: expect.any(Boolean),
					createdAt: expect.any(String),
				}),
			);
		});
	});

	// Testing auth & user permissions work.
	describe("Authentication & Permissions", () => {
		test("When authorized as regular user, the request should be forbidden", async () => {
			const accessToken = await testHelper.getUserAccessToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.get("/v1/server/settings").set("Authorization", `Bearer ${accessToken}`).send();

			expectForbidden(body, statusCode);
		});

		test("When unauthorized, the request should be unauthorized", async () => {
			const { body, statusCode } = await testHelper.client.get("/v1/server/settings").send();

			expectUnauthorized(body, statusCode);
		});
	});
});
