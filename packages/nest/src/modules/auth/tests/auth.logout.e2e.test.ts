import { describe, expect, test, beforeAll, beforeEach, afterAll } from "vitest";
import { sign } from "jsonwebtoken";

import { TestHelper } from "@testing/test-helper";
import { testUser1 } from "@testing/data/users";
import { expectBadRequest } from "@testing/common/expect-bad-request";
import { testInvalidDataTypes } from "@testing/common/test-invalid-data-types";
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
// todo: add data that revoked tokens actually are revoked and no longer work (when some are expired and some not)!!!!!

describe("Logout Auth", () => {
	describe("Success Cases", () => {
		test("When a valid refresh token a supplied, all tokens should be revoked", async () => {
			const { refreshToken, accessToken } = await testHelper.getUserTokens(testUser1.id);

			// Revoke the tokens, check that request succeeded
			const { statusCode: revokeStatusCode } = await testHelper.client.post("/v1/auth/logout").send({ refreshToken });
			expect(revokeStatusCode).toEqual(200);

			// Check that the refresh token has been revoked
			const { statusCode: refreshStatusCode } = await testHelper.client.post("/v1/auth/refresh").send({ refreshToken });
			expect(refreshStatusCode).toEqual(401);

			// Check that the access token has been revoked
			const { statusCode: accessStatusCode } = await testHelper.client.get("/v1/auth/check").set("Authorization", `Bearer ${accessToken}`);
			expect(accessStatusCode).toEqual(401);
		});
	});

	describe("Invalid/Expired Tokens", () => {
		test("When an expired refresh token is supplied, the request should fail", async () => {
			const envService = testHelper.getAppDependency<ConfigService>(ConfigService);
			const refreshToken = sign({ userId: testUser1.id, type: "refreshToken" }, envService.vars.auth.refreshToken.secret, { expiresIn: 0 });

			const { statusCode } = await testHelper.client.post("/v1/auth/logout").send({
				refreshToken,
			});

			expect(statusCode).toEqual(400);
		});

		test("When an incorrectly signed refresh token is supplied, the request should fail", async () => {
			//  Create a token with the expected payload but signed wrong
			const refreshToken = sign(
				{
					iss: "headbase",
					aud: "headbase",
					sub: testUser1.id,
					type: "refreshToken",
					gid: "bbafbee5-155b-4844-8f74-82bd442a4a1",
					cid: 1,
				},
				"aergsethsrjsrj",
				{ expiresIn: "1h" },
			);

			const { statusCode } = await testHelper.client.post("/v1/auth/logout").send({
				refreshToken,
			});

			expect(statusCode).toEqual(400);
		});

		test("When an invalid refresh token is supplied, the request should fail", async () => {
			const { body, statusCode } = await testHelper.client.post("/v1/auth/logout").send({
				refreshToken: "dagablejg",
			});

			expectBadRequest(body, statusCode);
		});
	});

	describe("Invalid Data", () => {
		describe("When not supplying refreshToken as a string, the request should fail", () => {
			testInvalidDataTypes({
				testHelper: testHelper,
				req: {
					clientMethod: "post",
					endpoint: "/v1/auth/logout",
					initialData: {},
				},
				testFieldKey: "refreshToken",
				testCases: [1, 1.5, true, { test: "yes" }, [1, 2]],
			});
		});
	});
});
