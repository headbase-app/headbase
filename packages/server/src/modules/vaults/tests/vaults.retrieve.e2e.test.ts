import { describe, expect, test, beforeAll, beforeEach, afterAll } from "@jest/globals";
import { HttpStatus } from "@nestjs/common";

import { ErrorIdentifiers } from "@headbase-app/contracts";

import { TestHelper } from "@testing/test-helper";
import { expectUnauthorized } from "@testing/common/expect-unauthorized";
import { expectForbidden } from "@testing/common/expect-forbidden";
import { expectNotFound } from "@testing/common/expect-not-found";
import { testAdminUser1, testAdminUser2Unverified, testUser1 } from "@testing/data/users";
import { testAdminUser1Vault1, testUser1Vault1 } from "@testing/data/vaults";
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

describe("Retrieve Vaults - /v1/vaults/:vaultId [GET]", () => {
	// Testing success cases/happy paths work.
	describe("Success Cases", () => {
		test("Given user with `user` role, When retrieving their own vault, Then the vault should be returned", async () => {
			const accessToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.get(`/v1/vaults/${testUser1Vault1.id}`).set("Authorization", `Bearer ${accessToken}`).send();

			expect(statusCode).toEqual(HttpStatus.OK);
			expect(body).toEqual(
				expect.objectContaining({
					...testUser1Vault1,
				}),
			);
		});

		// todo: should be moved to different test section?
		test("Given user with `user` role, When retrieving vault that doesn't exist, Then response should be '404 - not found'", async () => {
			const accessToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.get("/v1/vaults/99b8ffa1-411e-4cbc-bda0-ce5cb0749459").set("Authorization", `Bearer ${accessToken}`).send();

			expectNotFound(body, statusCode, ErrorIdentifiers.VAULT_NOT_FOUND);
		});

		test("Given user with 'admin' role, When retrieving their own vault, Then the vault should be returned", async () => {
			const accessToken = await testHelper.getSessionToken(testAdminUser1.id);

			const { body, statusCode } = await testHelper.client.get(`/v1/vaults/${testAdminUser1Vault1.id}`).set("Authorization", `Bearer ${accessToken}`).send();

			expect(statusCode).toEqual(HttpStatus.OK);
			expect(body).toEqual(
				expect.objectContaining({
					...testAdminUser1Vault1,
				}),
			);
		});

		test("Given user with 'admin' role, When retrieving vault owned by different user, Then the vault should be returned", async () => {
			const accessToken = await testHelper.getSessionToken(testAdminUser1.id);

			const { body, statusCode } = await testHelper.client.get(`/v1/vaults/${testUser1Vault1.id}`).set("Authorization", `Bearer ${accessToken}`).send();

			expect(statusCode).toEqual(HttpStatus.OK);
			expect(body).toEqual(
				expect.objectContaining({
					...testUser1Vault1,
				}),
			);
		});
	});

	// Testing auth & user permissions work.
	describe("Authentication & Permissions", () => {
		test("Given user that isn't authenticated, When retrieving a vault, Then response should be '401 - unauthorised'", async () => {
			const { body, statusCode } = await testHelper.client.get(`/v1/vaults/${testUser1Vault1.id}`).send();

			expectUnauthorized(body, statusCode);
		});

		test("Given user with 'user' role, When retrieving vault owned by different user, Then response should be '403 - forbidden'", async () => {
			const accessToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.get(`/v1/vaults/${testAdminUser1Vault1.id}`).set("Authorization", `Bearer ${accessToken}`).send();

			expectForbidden(body, statusCode);
		});

		test("Given unverified admin, When retrieving a vault, Then response should be '403 - forbidden'", async () => {
			const accessToken = await testHelper.getSessionToken(testAdminUser2Unverified.id);

			const { body, statusCode } = await testHelper.client.get(`/v1/vaults/${testUser1Vault1.id}`).set("Authorization", `Bearer ${accessToken}`).send();

			expectForbidden(body, statusCode, ErrorIdentifiers.AUTH_NOT_VERIFIED);
		});
	});

	describe("Logical Validation", () => {
		test("When retrieving vault with invalid id, Then response should be '400 - bad request'", async () => {
			const accessToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.get("/v1/vaults/random").set("Authorization", `Bearer ${accessToken}`).send({});

			expectBadRequest(body, statusCode);
		});
	});
});
