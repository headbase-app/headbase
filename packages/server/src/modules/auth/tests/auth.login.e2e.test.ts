import { describe, expect, test, beforeAll, beforeEach, afterAll } from "@jest/globals";

import { ErrorIdentifiers } from "@headbase-app/contracts";
import { TestHelper } from "@testing/test-helper";
import { testUser1 } from "@testing/data/users";
import { expectForbidden } from "@testing/common/expect-forbidden";
import { testMissingField } from "@testing/common/test-missing-field";
import { testMalformedData } from "@testing/common/test-malformed-data";
import { testInvalidDataTypes } from "@testing/common/test-invalid-data-types";

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

describe("Login Auth", () => {
	describe("Success Cases", () => {
		test("login returns user data and session token", async () => {
			const { body, statusCode } = await testHelper.client.post("/v1/auth/login").send({
				email: testUser1.email,
				password: testUser1.password,
			});

			expect(statusCode).toEqual(200);
			expect(body).toEqual(
				expect.objectContaining({
					user: {
						id: testUser1.id,
						email: testUser1.email,
						displayName: testUser1.displayName,
						verifiedAt: testUser1.verifiedAt,
						firstVerifiedAt: testUser1.firstVerifiedAt,
						role: testUser1.role,
						createdAt: testUser1.createdAt,
						updatedAt: testUser1.updatedAt,
					},
					sessionToken: expect.any(String),
				}),
			);

			// Check no password data is included in fetches user
			// todo: should this be a separate test?
			expect(body).not.toEqual(
				expect.objectContaining({
					passwordHash: testUser1.passwordHash,
					password: testUser1.password,
				}),
			);
		});
	});

	describe("Fail Cases", () => {
		test("invalid email and password is forbidden ", async () => {
			const { body, statusCode } = await testHelper.client.post("/v1/auth/login").send({
				email: "random@example.com",
				password: "random password",
			});

			expectForbidden(body, statusCode, ErrorIdentifiers.AUTH_CREDENTIALS_INVALID);
		});

		test("valid email and invalid password is forbidden", async () => {
			const { body, statusCode } = await testHelper.client.post("/v1/auth/login").send({
				email: testUser1.email,
				password: "random password",
			});

			expectForbidden(body, statusCode, ErrorIdentifiers.AUTH_CREDENTIALS_INVALID);
		});

		test("invalid email and valid password is forbidden", async () => {
			const { body, statusCode } = await testHelper.client.post("/v1/auth/login").send({
				email: "randomuser@example.com",
				password: testUser1.password,
			});

			expectForbidden(body, statusCode, ErrorIdentifiers.AUTH_CREDENTIALS_INVALID);
		});
	});

	describe("Required Fields", () => {
		test("When not supplying an email, the request should fail", async () => {
			await testMissingField({
				clientFunction: testHelper.client.post.bind(testHelper.client),
				endpoint: "/v1/auth/login",
				data: {
					email: testUser1.email,
					password: testUser1.password,
				},
				testFieldKey: "email",
			});
		});

		test("When not supplying a password, the request should fail", async () => {
			await testMissingField({
				clientFunction: testHelper.client.post.bind(testHelper.client),
				endpoint: "/v1/auth/login",
				data: {
					email: testUser1.email,
					password: testUser1.password,
				},
				testFieldKey: "password",
			});
		});
	});

	describe("Invalid Data", () => {
		test("When supplying invalid JSON data, the request should fail", async () => {
			const accessToken = await testHelper.getSessionToken(testUser1.id);

			await testMalformedData({
				clientFunction: testHelper.client.post.bind(testHelper.client),
				endpoint: "/v1/auth/login",
				accessToken: accessToken,
			});
		});

		describe("When not supplying email as a string, the request should fail", () => {
			testInvalidDataTypes({
				testHelper: testHelper,
				req: {
					clientMethod: "post",
					endpoint: "/v1/auth/login",
					initialData: {
						password: "test-password",
					},
				},
				testFieldKey: "email",
				testCases: [1, 1.5, true, null, { test: "yes" }, [1, 2]],
			});
		});

		describe("When not supplying password as a string, the request should fail", () => {
			testInvalidDataTypes({
				testHelper: testHelper,
				req: {
					clientMethod: "post",
					endpoint: "/v1/auth/login",
					initialData: {
						email: testUser1.email,
					},
				},
				testFieldKey: "password",
				testCases: [1, 1.5, true, null, { test: "yes" }, [1, 2]],
			});
		});
	});
});
