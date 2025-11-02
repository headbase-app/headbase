import { describe, expect, test, beforeAll, beforeEach, afterAll } from "@jest/globals";

import { TestHelper } from "@testing/test-helper";
import { testUser1 } from "@testing/data/users";
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

// todo: remove direct use of DI container?

describe("Check Auth", () => {
	test("authenticated request with session token succeeds", async () => {
		const sessionToken = await testHelper.getSessionToken(testUser1.id);

		const { statusCode } = await testHelper.client.get("/v1/auth/check").set("Authorization", `Bearer ${sessionToken}`);

		expect(statusCode).toEqual(200);
	});

	test("unauthenticated request is unauthorized", async () => {
		const { body, statusCode } = await testHelper.client.get("/v1/auth/check");

		expectUnauthorized(body, statusCode);
	});

	test("invalid session token is unauthorized", async () => {
		const { body, statusCode } = await testHelper.client.get("/v1/auth/check").set("Authorization", "Bearer SWFubawgrlkx");

		expectUnauthorized(body, statusCode);
	});
});
