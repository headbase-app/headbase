import { describe, expect, test, beforeAll, beforeEach, afterAll } from "@jest/globals";
import { HttpStatus } from "@nestjs/common";

import { ErrorIdentifiers } from "@headbase-app/contracts";

import { TestHelper } from "@testing/test-helper";
import { expectUnauthorized } from "@testing/common/expect-unauthorized";
import { expectForbidden } from "@testing/common/expect-forbidden";
import { testAdminUser1, testUser1 } from "@testing/data/users";
import { testAdminUser1Vault1, testUser1Vault1 } from "@testing/data/vaults";
import { expectBadRequest } from "@testing/common/expect-bad-request";
import { expectNotFound } from "@testing/common/expect-not-found";

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

describe("Delete Profile - /v1/vaults/:userId [DELETE]", () => {
	// Testing success cases/happy paths work.
	describe("Success Cases", () => {
		test("Given user with 'user' role, When deleting their own vault, Then the vault should be deleted", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { statusCode } = await testHelper.client.delete(`/v1/vaults/${testUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send();
			expect(statusCode).toEqual(HttpStatus.OK);

			const { statusCode: checkStatusCode } = await testHelper.client.get(`/v1/vaults/${testUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send();
			expect(checkStatusCode).toEqual(HttpStatus.NOT_FOUND);
		});

		test("Given user with 'admin' role, When deleting their own vault, Then the vault should be deleted", async () => {
			const sessionToken = await testHelper.getSessionToken(testAdminUser1.id);

			const { statusCode } = await testHelper.client.delete(`/v1/vaults/${testAdminUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send();
			expect(statusCode).toEqual(HttpStatus.OK);

			const { statusCode: checkStatusCode } = await testHelper.client.get(`/v1/vaults/${testAdminUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send();
			expect(checkStatusCode).toEqual(HttpStatus.NOT_FOUND);
		});

		test("Given user with 'admin' role, When deleting a different user vault, Then the vault should be deleted", async () => {
			const sessionToken = await testHelper.getSessionToken(testAdminUser1.id);

			const { statusCode } = await testHelper.client.delete(`/v1/vaults/${testUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send();
			expect(statusCode).toEqual(HttpStatus.OK);

			const { statusCode: checkStatusCode } = await testHelper.client.get(`/v1/vaults/${testUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send();
			expect(checkStatusCode).toEqual(HttpStatus.NOT_FOUND);
		});
	});

	// Testing auth & user permissions work.
	describe("Authentication & Permissions", () => {
		test("Given unauthenticated user, When deleting vault, Then response should be '401 - unauthorised'", async () => {
			const { body, statusCode } = await testHelper.client.delete(`/v1/vaults/${testUser1Vault1.id}`).send();

			expectUnauthorized(body, statusCode);
		});

		test("Given user with 'user' role, When deleting a different users vault, Then response should be '403 - forbidden'", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { statusCode, body } = await testHelper.client.delete(`/v1/vaults/${testAdminUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send();

			expectForbidden(body, statusCode);
		});
	});

	describe("Logical Validation", () => {
		test("When deleting vault with invalid id, Then response should be '400 - bad request'", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.delete("/v1/vaults/random").set("Authorization", `Bearer ${sessionToken}`).send();

			expectBadRequest(body, statusCode);
		});

		test("When attempting to delete a none existent vault, Then response should be '404 - not found'", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.delete("/v1/vaults/b283f9e5-f386-4503-abc3-a31729f333e1").set("Authorization", `Bearer ${sessionToken}`).send({});

			expectNotFound(body, statusCode, ErrorIdentifiers.VAULT_NOT_FOUND);
		});
	});
});
