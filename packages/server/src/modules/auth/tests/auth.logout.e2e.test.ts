import { describe, expect, test, beforeAll, beforeEach, afterAll } from "@jest/globals";
import { TestHelper } from "@testing/test-helper";
import { testUser1 } from "@testing/data/users";
import { expectBadRequest } from "@testing/common/expect-bad-request";
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
// todo: add data that revoked tokens actually are revoked and no longer work (when some are expired and some not)!!!!!

describe("Logout Auth", () => {
	describe("Success Cases", () => {
		test("When a user logs out of a session, future requests with the same session token should fail.", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			// Logout of the current session, check that request succeeded
			const { statusCode: revokeStatusCode } = await testHelper.client.post("/v1/auth/logout").set("Authorization", `Bearer ${sessionToken}`).send();
			expect(revokeStatusCode).toEqual(200);

			// Check that the session has been revoked
			const { statusCode: accessStatusCode } = await testHelper.client.get("/v1/auth/check").set("Authorization", `Bearer ${sessionToken}`).send();
			expect(accessStatusCode).toEqual(401);
		});
	});

	describe("Invalid/Expired Tokens", () => {
		// todo: test if using encrypt/hash not raw token.
		test.todo("When an incorrectly signed session token is supplied, the request should fail");

		test("When an invalid session token is supplied, the request should fail", async () => {
			const { body, statusCode } = await testHelper.client.post("/v1/auth/logout").set("Authorization", `Bearer wewrqwqwtwqt`).send();

			expectUnauthorized(body, statusCode);
		});
	});
});
