import { afterAll, beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import { TestHelper } from "@testing/test-helper";
import { testUser1 } from "@testing/data/users";
import { testUser1Vault1 } from "@testing/data/vaults";
import { expectBadRequest } from "@testing/common/expect-bad-request";

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

// todo: add further tests, including auth checks, invalid data etc
describe("Chunk Upload - /v1/chunks/:vaultId/:hash [POST]", () => {
	test("When object doesn't exist, upload URL should be returned", async () => {
		const accessToken = await testHelper.getUserAccessToken(testUser1.id);

		const { body } = await testHelper.client.post(`/v1/chunks/${testUser1Vault1.id}/noexists`).set("Authorization", `Bearer ${accessToken}`).send();

		expect(body).toEqual(
			expect.objectContaining({
				url: expect.any(String),
			}),
		);
	});

	test("When object exist, 400 error should be returned", async () => {
		const accessToken = await testHelper.getUserAccessToken(testUser1.id);

		const { body, statusCode } = await testHelper.client.post(`/v1/chunks/${testUser1Vault1.id}/exists`).set("Authorization", `Bearer ${accessToken}`).send();

		// todo: should be returning.expecting specific error code?
		expectBadRequest(body, statusCode);
	});
});
