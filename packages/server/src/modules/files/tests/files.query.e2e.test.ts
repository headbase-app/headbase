import { test, describe, afterAll, beforeAll, beforeEach, expect } from "@jest/globals";

import { TestHelper } from "@testing/test-helper";
import { testUser1 } from "@testing/data/users";
import { testUser1Vault2 } from "@testing/data/vaults";

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

describe("Query Files - /v1/files [GET]", () => {
	// Testing success cases/happy paths work.
	describe("Success Cases", () => {
		test("When fetching vault with 0 files, empty results shouls be returned.", async () => {
			const accessToken = await testHelper.getUserAccessToken(testUser1.id);

			const { body, statusCode } = await testHelper.client
				// query string used as supertest/agent doesn't seem to handle arrays
				.get(`/v1/files?offset=0&limit=42&vaultIds[]=${testUser1Vault2.id}`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send();

			expect(statusCode).toEqual(200);
			expect(body).toEqual({
				meta: {
					results: 0,
					offset: 0,
					limit: 42,
					total: 0,
				},
				results: [],
			});
		});
	});

	// Testing auth & permissions work.
	describe("Invalid Authentication", () => {});

	// Testing all unique constraint work.
	describe("None Unique Data", () => {});

	// Data validation .
	describe("Data Validation", () => {});

	// Testing relationship validation works (fails on invalid foreign keys).
	describe("Relationship Validation", () => {});

	// Testing internal/system fields are not user editable (timestamps, id, owner relationships etc).
	describe("Forbidden Fields", () => {});

	// Testing invalid type validation works (pass number to sting field, malformed data etc).
	describe("Invalid Data", () => {});
});
