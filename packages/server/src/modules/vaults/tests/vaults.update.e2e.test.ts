import { describe, expect, test, beforeAll, beforeEach, afterAll } from "vitest";
import { HttpStatus } from "@nestjs/common";

import { TestHelper } from "@testing/test-helper.js";
import { expectUnauthorized } from "@testing/common/expect-unauthorized";
import { expectForbidden } from "@testing/common/expect-forbidden";
import { testAdminUser1, testUser1, testUser2Unverified } from "@testing/data/users";
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

describe("Update Vaults - /v1/vaults [PATCH]", () => {
	// Testing success cases/happy paths work.
	describe("Success Cases", () => {
		test("Given user with 'user' role, When updating their own vault, Then the vault should be updated", async () => {
			const name = "updatedName";
			const protectedEncryptionKey = "updatedProtectedEncryptionKey";
			const protectedData = "updatedProtectedData";
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const response = await testHelper.client.patch(`/v1/vaults/${testUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send({
				name,
				protectedEncryptionKey,
				protectedData,
			});
			expect(response.statusCode).toEqual(HttpStatus.OK);

			const { statusCode: checkStatusCode, body: checkBody } = await testHelper.client.get(`/v1/vaults/${testUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send();

			expect(checkStatusCode).toEqual(HttpStatus.OK);
			expect(checkBody).toEqual(
				expect.objectContaining({
					...testUser1Vault1,
					name,
					protectedEncryptionKey,
					protectedData,
					// todo: add test for timestamp showing today's date after updating
					updatedAt: expect.any(String),
				}),
			);
		});

		test("Given user with 'admin' role, When updating their own vault, Then the vault should be updated", async () => {
			const name = "updatedName";
			const protectedEncryptionKey = "updatedProtectedEncryptionKey";
			const protectedData = "updatedProtectedData";
			const sessionToken = await testHelper.getSessionToken(testAdminUser1.id);

			const { statusCode } = await testHelper.client.patch(`/v1/vaults/${testAdminUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send({
				name,
				protectedEncryptionKey,
				protectedData,
			});
			expect(statusCode).toEqual(HttpStatus.OK);

			const { statusCode: checkStatusCode, body: checkBody } = await testHelper.client.get(`/v1/vaults/${testAdminUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send();

			expect(checkStatusCode).toEqual(HttpStatus.OK);
			expect(checkBody).toEqual(
				expect.objectContaining({
					...testAdminUser1Vault1,
					name,
					protectedEncryptionKey,
					protectedData,
					updatedAt: expect.any(String),
				}),
			);
		});

		test("Given user with 'admin' role, When updating a different users vault, Then the vault should be updated", async () => {
			const name = "updatedName";
			const protectedEncryptionKey = "updatedProtectedEncryptionKey";
			const protectedData = "updatedProtectedData";
			const sessionToken = await testHelper.getSessionToken(testAdminUser1.id);

			const { statusCode } = await testHelper.client.patch(`/v1/vaults/${testUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send({
				name,
				protectedEncryptionKey,
				protectedData,
			});
			expect(statusCode).toEqual(HttpStatus.OK);

			const { statusCode: checkStatusCode, body: checkBody } = await testHelper.client.get(`/v1/vaults/${testUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send();

			expect(checkStatusCode).toEqual(HttpStatus.OK);
			expect(checkBody).toEqual(
				expect.objectContaining({
					...testUser1Vault1,
					name,
					protectedEncryptionKey,
					protectedData,
					updatedAt: expect.any(String),
				}),
			);
		});
	});

	// Testing auth & user permissions work.
	describe("Authentication & Permissions", () => {
		test("Given unauthenticated user, When updating a vault, Then response should be '401 - unauthorized'", async () => {
			const { statusCode, body } = await testHelper.client.patch(`/v1/vaults/${testUser1Vault1.id}`).send({
				name: "updatedName",
			});

			expectUnauthorized(body, statusCode);
		});

		test("Given user with 'user' role, When updating a different users vault, Then response should be '403 - forbidden'", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { statusCode, body } = await testHelper.client.patch(`/v1/vaults/${testAdminUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send({
				name: "updatedName",
			});

			expectForbidden(body, statusCode);
		});
	});
	//
	//   // Testing all unique constraint work.
	//   describe("Unique Validation", () => {})
	//
	//   // Testing all required field work.
	//   describe("Required Field Validation", () => {})
	//
	// Testing internal/system fields are not user editable (timestamps, id, owner relationships etc).
	describe("Forbidden Field Validation", () => {
		test("When attempting to update vault owner, Then response should be '400 - bad request'", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { statusCode, body } = await testHelper.client.patch(`/v1/vaults/${testUser1Vault1.id}`).set("Authorization", `Bearer ${sessionToken}`).send({
				ownerId: testUser2Unverified.id,
			});

			expectBadRequest(body, statusCode);
		});
	});
	//
	//   // Testing logical validation works (string formats like email, number ranges, etc)
	//   describe("Logical Validation", () => {})
	//
	//   // Testing relationship validation works (fails on invalid foreign keys).
	//   describe("Relationship Validation", () => {})
	//
	//   // Testing invalid type validation works (pass number to sting field, malformed data etc).
	//   describe("Type Validation", () => {})
});
