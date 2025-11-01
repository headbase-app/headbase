import { ErrorIdentifiers } from "@headbase-app/contracts";
import { TestHelper } from "@testing/test-helper";
import { expectUnauthorized } from "@testing/common/expect-unauthorized";
import { expectForbidden } from "@testing/common/expect-forbidden";
import { expectBadRequest } from "@testing/common/expect-bad-request";
import { testAdminUser1, testUser1, testUser2Unverified } from "@testing/data/users";
import { describe, test, expect, afterAll, beforeAll, beforeEach } from "@jest/globals";

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

describe("Delete User - /v1/users/:id [DELETE]", () => {
	test("When unauthorized, the request should fail", async () => {
		const { body, statusCode } = await testHelper.client.delete(`/v1/users/${testUser1.id}`);

		expectUnauthorized(body, statusCode);
	});

	test("When authorized as the user to delete, the request & deletion should succeed", async () => {
		const sessionToken = await testHelper.getSessionToken(testUser1.id);

		// Make the delete request
		const { statusCode: deleteStatusCode } = await testHelper.client.delete(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`);
		expect(deleteStatusCode).toEqual(200);

		// Re-fetch the user to ensure its been deleted
		const adminSessionToken = await testHelper.getSessionToken(testAdminUser1.id);
		const { statusCode: getStatusCode, body: getBody } = await testHelper.client.get(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${adminSessionToken}`);
		expectBadRequest(getBody, getStatusCode, ErrorIdentifiers.USER_NOT_FOUND);
	});

	// todo: add role access control tests
	test("When authorized as a different user to the one to delete, the request should fail", async () => {
		const accessToken = await testHelper.getSessionToken(testUser1.id);

		const { body, statusCode } = await testHelper.client.delete(`/v1/users/${testUser2Unverified.id}`).set("Authorization", `Bearer ${accessToken}`);

		expectForbidden(body, statusCode);
	});

	test("When attempting to delete a none existent user, the request should fail", async () => {
		const accessToken = await testHelper.getSessionToken(testUser1.id);

		const { body, statusCode } = await testHelper.client.delete("/v1/users/82f7d7a4-e094-4f15-9de0-5b5621376714").set("Authorization", `Bearer ${accessToken}`);

		expectForbidden(body, statusCode);
	});

	test("When passing an invalid user ID, the request should fail", async () => {
		const accessToken = await testHelper.getSessionToken(testUser1.id);

		const { body, statusCode } = await testHelper.client.delete("/v1/users/invalid").set("Authorization", `Bearer ${accessToken}`);

		expectBadRequest(body, statusCode, ErrorIdentifiers.REQUEST_INVALID);
	});
});
