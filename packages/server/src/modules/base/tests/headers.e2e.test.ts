import { afterAll, beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import { TestHelper } from "@testing/test-helper";

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

describe("Global Headers", () => {
	test("x-powered-by header should be removed", async () => {
		const { headers } = await testHelper.client.get("/");

		expect(headers["x-powered-by"]).toBeUndefined();
	});

	test("x-clacks-overhead header should be present", async () => {
		const { headers } = await testHelper.client.get("/");

		expect(headers["x-clacks-overhead"]).toEqual("GNU Terry Pratchett");
	});
});
