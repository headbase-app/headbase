import { describe, expect, test, beforeAll, beforeEach, afterAll } from "@jest/globals";

import { ErrorIdentifiers } from "@headbase-app/contracts";

import { TestHelper } from "@testing/test-helper";
import { testAdminUser2Unverified, testUser2Unverified } from "@testing/data/users";
import { expectForbidden } from "@testing/common/expect-forbidden";

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

describe("Email Verification - /v1/auth/verify-email [GET, POST]", () => {
	// Testing success cases/happy paths work.
	describe("Success Cases", () => {
		test("authenticated user can request email verification", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser2Unverified.id);

			const { statusCode } = await testHelper.client.get("/v1/auth/verify-email").set("Authorization", `Bearer ${sessionToken}`).send();

			expect(statusCode).toEqual(200);
		});

		test("authenticated admin can request email verification", async () => {
			const sessionToken = await testHelper.getSessionToken(testAdminUser2Unverified.id);

			const { statusCode } = await testHelper.client.get("/v1/auth/verify-email").set("Authorization", `Bearer ${sessionToken}`).send();

			expect(statusCode).toEqual(200);
		});

		test("authenticated user can verify their email", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser2Unverified.id);
			const token = testHelper.getEmailVerificationToken(testUser2Unverified.id);

			const { statusCode, body } = await testHelper.client.post("/v1/auth/verify-email").set("Authorization", `Bearer ${sessionToken}`).send({
				token,
			});

			expect(statusCode).toEqual(200);
			expect(body).toEqual(
				expect.objectContaining({
					id: testUser2Unverified.id,
					email: testUser2Unverified.email,
					displayName: testUser2Unverified.displayName,
					verifiedAt: expect.any(String),
					firstVerifiedAt: expect.any(String),
					role: testUser2Unverified.role,
					createdAt: testUser2Unverified.createdAt,
					updatedAt: expect.any(String),
				}),
			);
		});

		test("authenticated admin can verify their email", async () => {
			const sessionToken = await testHelper.getSessionToken(testAdminUser2Unverified.id);
			const token = testHelper.getEmailVerificationToken(testAdminUser2Unverified.id);

			const { statusCode, body } = await testHelper.client.post("/v1/auth/verify-email").set("Authorization", `Bearer ${sessionToken}`).send({
				token,
			});

			expect(statusCode).toEqual(200);
			expect(body).toEqual(
				expect.objectContaining({
					id: testAdminUser2Unverified.id,
					email: testAdminUser2Unverified.email,
					displayName: testAdminUser2Unverified.displayName,
					verifiedAt: expect.any(String),
					firstVerifiedAt: expect.any(String),
					role: testAdminUser2Unverified.role,
					createdAt: testAdminUser2Unverified.createdAt,
					updatedAt: expect.any(String),
				}),
			);
		});

		test("user can perform actions once verified ", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser2Unverified.id);
			const verificationToken = testHelper.getEmailVerificationToken(testUser2Unverified.id);

			// Initial attempt to fetch own user should fail as unverified
			const { statusCode: initialCreateStatusCode, body: initialCreateBody } = await testHelper.client
				// ignoring prettier
				.get(`/v1/users/${testUser2Unverified.id}`)
				.set("Authorization", `Bearer ${sessionToken}`)
				.send();
			expectForbidden(initialCreateBody, initialCreateStatusCode, ErrorIdentifiers.AUTH_NOT_VERIFIED);

			// Now verify user
			const { statusCode: verifyStatusCode } = await testHelper.client
				// ignoring prettier
				.post("/v1/auth/verify-email")
				.set("Authorization", `Bearer ${sessionToken}`)
				.send({
					token: verificationToken,
				});
			expect(verifyStatusCode).toEqual(200);

			// Now verification is complete, should be able to fetch own user
			const { statusCode: verifiedCreateStatusCode } = await testHelper.client
				// ignoring prettier
				.get(`/v1/users/${testUser2Unverified.id}`)
				.set("Authorization", `Bearer ${sessionToken}`)
				.send();
			expect(verifiedCreateStatusCode).toEqual(200);
		});
	});

	// Testing auth & user permissions work.
	// describe("Authentication & Permissions", () => {})

	// Testing all unique constraint work.
	// describe("Unique Validation", () => {})

	// Testing all required field work.
	// describe("Required Field Validation", () => {})

	// Testing internal/system fields are not user editable (timestamps, id, owner relationships etc).
	// describe("Forbidden Field Validation", () => {})

	// Testing logical validation works (string formats like email, number ranges, etc)
	// describe("Logical Validation", () => {})

	// Testing relationship validation works (fails on invalid foreign keys).
	// describe("Relationship Validation", () => {})

	// Testing invalid type validation works (pass number to sting field, malformed data etc).
	// describe("Type Validation", () => {})
});
