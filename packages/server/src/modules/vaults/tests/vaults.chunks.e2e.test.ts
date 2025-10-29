import { describe, expect, test, beforeAll, beforeEach, afterAll } from "@jest/globals";
import { HttpStatus } from "@nestjs/common";

import { TestHelper } from "@testing/test-helper";
import { testUser1 } from "@testing/data/users";
import { testUser1Vault1, testUser1Vault2 } from "@testing/data/vaults";

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

describe("Fetch Vault Chunks - /v1/vaults/:vaultId/chunks [GET]", () => {
	// Testing success cases/happy paths work.
	describe("Success Cases", () => {
		test("When fetching from vault with chunks, all chunks should be returned.", async () => {
			const accessToken = await testHelper.getUserAccessToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.get(`/v1/vaults/${testUser1Vault1.id}/chunks`).set("Authorization", `Bearer ${accessToken}`).send();

			expect(statusCode).toEqual(HttpStatus.OK);
			expect(body).toEqual(["exists"]);
		});

		test("When fetching from vault with no chunks, no chunks should be returned.", async () => {
			const accessToken = await testHelper.getUserAccessToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.get(`/v1/vaults/${testUser1Vault2.id}/chunks`).set("Authorization", `Bearer ${accessToken}`).send();

			expect(statusCode).toEqual(HttpStatus.OK);
			expect(body).toEqual([]);
		});

		// todo: test pagination of ObjectStoreService.query works, mock/set smaller limit for testing?
	});

	// // Testing auth & user permissions work.
	// describe("Authentication & Permissions", () => {});
	//
	// // Testing all unique constraint work.
	// describe("Unique Validation", () => {});
	//
	// // Testing all required field work.
	// describe("Required Field Validation", () => {});
	//
	// // Testing internal/system fields are not user editable (timestamps, id, owner relationships etc).
	// describe("Forbidden Field Validation", () => {});
	//
	// // Testing logical validation works (string formats like email, number ranges, etc)
	// describe("Logical Validation", () => {});
	//
	// // Testing relationship validation works (fails on invalid foreign keys).
	// describe("Relationship Validation", () => {});
	//
	// // Testing invalid type validation works (pass number to sting field, malformed data etc).
	// describe("Type Validation", () => {});
});
