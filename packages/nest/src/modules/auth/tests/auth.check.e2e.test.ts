import { describe, expect, test, beforeAll, beforeEach, afterAll } from "vitest";

import { sign } from "jsonwebtoken";

import { TestHelper } from "@testing/test-helper";
import { testUser1 } from "@testing/data/users";
import { expectUnauthorized } from "@testing/common/expect-unauthorized";
import { ConfigService } from "@services/config/config.service";

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

// todo: remove direct use of DI container?

describe("Check Auth", () => {
	test("authenticated request succeeds", async () => {
		const accessToken = await testHelper.getUserAccessToken(testUser1.id);

		const { statusCode } = await testHelper.client.get("/v1/auth/check").set("Authorization", `Bearer ${accessToken}`);

		expect(statusCode).toEqual(200);
	});

	test("unauthenticated request is unauthorized", async () => {
		const { body, statusCode } = await testHelper.client.get("/v1/auth/check");

		expectUnauthorized(body, statusCode);
	});

	test("incorrectly signed access token is unauthorized", async () => {
		const accessToken = sign({ type: "accessToken", userId: testUser1.id, role: testUser1.role }, "qethwrthwrthr", { expiresIn: "1hr" });

		const { body, statusCode } = await testHelper.client.get("/v1/auth/check").set("Authorization", `Bearer ${accessToken}`);

		expectUnauthorized(body, statusCode);
	});

	test("invalid access token is unauthorized", async () => {
		const { body, statusCode } = await testHelper.client.get("/v1/auth/check").set("Authorization", "Bearer SWFubawgrlkx");

		expectUnauthorized(body, statusCode);
	});

	test("expired access token is unauthorized", async () => {
		const configService = testHelper.getAppDependency<ConfigService>(ConfigService);
		const accessToken = sign({ type: "accessToken", userId: testUser1.id, role: testUser1.role }, configService.vars.auth.accessToken.secret, { expiresIn: 0 });

		const { body, statusCode } = await testHelper.client.get("/v1/auth/check").set("Authorization", `Bearer ${accessToken}`);

		expectUnauthorized(body, statusCode);
	});
});
