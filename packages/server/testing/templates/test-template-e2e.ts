import { test, describe, afterAll, beforeAll, beforeEach, expect } from "@jest/globals";

import { TestHelper } from "@testing/test-helper";
import { testUser1 } from "@testing/data/users";

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

describe("Short Description - /v1/path [METHOD]", () => {
	// Testing success cases/happy paths work.
	describe("Success Cases", () => {
		test("Given CONTEXT, When ACTION, Then RESULT", async () => {
			const accessToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.post("/v1/ROUTE").set("Authorization", `Bearer ${accessToken}`).send({});

			expect(statusCode).toEqual(200);
			expect(body).toEqual(
				expect.objectContaining({
					field: "value",
				}),
			);
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
