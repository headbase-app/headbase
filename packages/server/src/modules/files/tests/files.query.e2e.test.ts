import { test, describe, afterAll, beforeAll, beforeEach, expect } from "vitest";

import { TestHelper } from "@testing/test-helper.js";
import { testUser1 } from "@testing/data/users.js";
import { testUser1Vault2 } from "@testing/data/vaults.js";

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
		test("When fetching vault with 0 files, empty results should be returned.", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client
				// query string used as supertest/agent doesn't seem to handle arrays
				.get(`/v1/files?offset=0&limit=42&vaultIds[]=${testUser1Vault2.id}`)
				.set("Authorization", `Bearer ${sessionToken}`)
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
	describe.todo("Invalid Authentication", () => {});

	// Testing all unique constraint work.
	describe.todo("None Unique Data", () => {});

	// Data validation .
	describe.todo("Data Validation", () => {});

	// Testing relationship validation works (fails on invalid foreign keys).
	describe.todo("Relationship Validation", () => {});

	// Testing internal/system fields are not user editable (timestamps, id, owner relationships etc).
	describe.todo("Forbidden Fields", () => {});

	// Testing invalid type validation works (pass number to sting field, malformed data etc).
	describe.todo("Invalid Data", () => {});
});
