import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { TestHelper } from "@testing/test-helper.js";
import { testUser1 } from "@testing/data/users";
import { testUser1Vault1 } from "@testing/data/vaults";
import { expectNotFound } from "@testing/common/expect-not-found";
import { ErrorIdentifiers } from "@headbase-app/contracts";

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
describe("Chunk Download - /v1/chunks/:vaultId/:hash [GET]", () => {
	test("When object exist, download URL should be returned", async () => {
		const sessionToken = await testHelper.getSessionToken(testUser1.id);

		const { body } = await testHelper.client.get(`/v1/chunks/${testUser1Vault1.id}/exists`).set("Authorization", `Bearer ${sessionToken}`).send();

		expect(body).toEqual(
			expect.objectContaining({
				url: expect.any(String),
			}),
		);
	});

	test("When object doesn't exist, 404 not found error should be returned", async () => {
		const sessionToken = await testHelper.getSessionToken(testUser1.id);

		const { body, statusCode } = await testHelper.client.get(`/v1/chunks/${testUser1Vault1.id}/noexists`).set("Authorization", `Bearer ${sessionToken}`).send();

		// todo: should be returning.expecting specific error code?
		expectNotFound(body, statusCode, ErrorIdentifiers.RESOURCE_NOT_FOUND);
	});
});
