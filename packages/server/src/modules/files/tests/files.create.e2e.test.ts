import { test, describe, afterAll, beforeAll, beforeEach } from "vitest";

import { TestHelper } from "@testing/test-helper.js";

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

describe.todo("Create File - /v1/files [POST]", () => {
	// Testing success cases/happy paths work.
	describe("Success Cases", () => {});

	// Testing auth & permissions work.
	describe("Invalid Authentication", () => {});

	// Testing all unique constraint work.
	describe("None Unique Data", () => {});

	// Data validation .
	describe("Data Validation", () => {});

	// Testing relationship validation works (fails on invalid foreign keys).
	describe("Relationship Validation", () => {});

	// Testing internal/system fields are not user editable (timestamps, id, owner relationships etc).
	describe("Forbidden Fields", () => {
		test.todo("When passing a committedAt field, the request should fail");
	});

	// Testing invalid type validation works (pass number to sting field, malformed data etc).
	describe("Invalid Data", () => {});
});
