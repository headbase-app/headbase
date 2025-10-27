import { describe, expect, test, beforeAll, beforeEach, afterAll } from "@jest/globals";

import { ErrorIdentifiers } from "@headbase-app/contracts";
import { TestHelper } from "@testing/test-helper";
import { expectUnauthorized } from "@testing/common/expect-unauthorized";
import { expectForbidden } from "@testing/common/expect-forbidden";
import { expectBadRequest } from "@testing/common/expect-bad-request";
import { testUser1, testUser2Unverified } from "@testing/data/users";

const testHelper: TestHelper = new TestHelper();
beforeAll(async () => {
	await testHelper.beforeAll();
});
afterAll(async () => {
	await testHelper.afterAll();
});
beforeEach(async () => {
	await testHelper.beforeEach();
});

describe("Get User - /v1/users/:id [GET]", () => {
	test("When unauthorized, the request should fail", async () => {
		const { body, statusCode } = await testHelper.client.get(`/v1/users/${testUser1.id}`);

		expectUnauthorized(body, statusCode);
	});

	test("When authorized as the user to get, the response should succeed and return the user", async () => {
		const accessToken = await testHelper.getUserAccessToken(testUser1.id);

		const { body, statusCode } = await testHelper.client.get(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${accessToken}`);

		const expectedUser = {
			id: testUser1.id,
			email: testUser1.email,
			displayName: testUser1.displayName,
			verifiedAt: testUser1.verifiedAt,
			firstVerifiedAt: testUser1.firstVerifiedAt,
			role: testUser1.role,
			createdAt: testUser1.createdAt,
			updatedAt: testUser1.updatedAt,
		};

		expect(statusCode).toEqual(200);
		expect(body).toEqual(expectedUser);
	});

	test("When authorized as a different user to the one to get, the request should fail", async () => {
		const accessToken = await testHelper.getUserAccessToken(testUser1.id);

		const { body, statusCode } = await testHelper.client.get(`/v1/users/${testUser2Unverified.id}`).set("Authorization", `Bearer ${accessToken}`);

		expectForbidden(body, statusCode);
	});

	// todo: reword to call out that 404 is not expected here and why?
	test("When fetching a user that doesn't exist, the request should fail", async () => {
		const accessToken = await testHelper.getUserAccessToken(testUser1.id);

		const { body, statusCode } = await testHelper.client.get("/v1/users/82f7d7a4-e094-4f15-9de0-5b5621376714").set("Authorization", `Bearer ${accessToken}`);

		expectForbidden(body, statusCode);
	});

	test("When passing an invalid ID, the request should fail", async () => {
		const accessToken = await testHelper.getUserAccessToken(testUser1.id);

		const { body, statusCode } = await testHelper.client.get("/v1/users/invalid").set("Authorization", `Bearer ${accessToken}`);

		expectBadRequest(body, statusCode, ErrorIdentifiers.REQUEST_INVALID);
	});
});
