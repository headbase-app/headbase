import { describe, expect, test, beforeAll, beforeEach, afterAll } from "vitest";

import { ErrorIdentifiers } from "@headbase-app/contracts";
import { TestHelper } from "@testing/test-helper.js";
import { expectUnauthorized } from "@testing/common/expect-unauthorized.js";
import { expectForbidden } from "@testing/common/expect-forbidden.js";
import { expectBadRequest } from "@testing/common/expect-bad-request.js";
import { testMalformedData } from "@testing/common/test-malformed-data.js";
import { testUser1, testUser2Unverified } from "@testing/data/users.js";

const testHelper: TestHelper = new TestHelper();
beforeAll(async () => {
	await testHelper.beforeAll();
});
afterAll(async () => {
	await testHelper.afterAll();
});
beforeEach(async () => {
	await testHelper.beforeEach();
});

describe("Update User - /v1/users/:id [PATCH]", () => {
	const testHelper: TestHelper = new TestHelper();

	beforeAll(async () => {
		await testHelper.beforeAll();
	});
	afterAll(async () => {
		await testHelper.afterAll();
	});
	beforeEach(async () => {
		await testHelper.beforeEach();
	});

	describe("Success Cases", () => {
		test("When authorized as the user to update, the response should succeed and return the updated user", async () => {
			const dataToUpdate = {
				displayName: "testudpated1",
			};

			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`).send(dataToUpdate);

			expect(statusCode).toEqual(200);
			expect(body).toEqual(
				expect.objectContaining({
					id: testUser1.id,
					email: testUser1.email,
					displayName: dataToUpdate.displayName,
					verifiedAt: testUser1.verifiedAt,
					firstVerifiedAt: testUser1.firstVerifiedAt,
					role: testUser1.role,
					createdAt: testUser1.createdAt,
					updatedAt: expect.any(String),
				}),
			);
		});

		test("When updating a user, the updatedAt timestamp should become more recent", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`).send({ email: "udpated@example.com" });

			expect(statusCode).toEqual(200);

			const previousTimestamp = new Date(testUser1.updatedAt);
			const updatedTimestamp = new Date(body.updatedAt);

			expect(updatedTimestamp.getTime()).toBeGreaterThan(previousTimestamp.getTime());
		});
	});

	describe("Invalid Authentication", () => {
		test("When unauthorized, the request should fail", async () => {
			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).send({ displayName: "updateduser1" });

			expectUnauthorized(body, statusCode);
		});

		test("When authorized as a different user to the one to update, the request should fail", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser2Unverified.id}`).set("Authorization", `Bearer ${sessionToken}`).send({ displayName: "updateduser1" });

			expectForbidden(body, statusCode);
		});

		test("When updating a user that doesn't exist, the request should fail", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch("/v1/users/82f7d7a4-e094-4f15-9de0-5b5621376714").set("Authorization", `Bearer ${sessionToken}`).send({ displayName: "updateduser1" });

			expectForbidden(body, statusCode);
		});

		test("When passing an invalid ID, the request should fail", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch("/v1/users/invalid").set("Authorization", `Bearer ${sessionToken}`).send({ username: "updatedusername" });

			expectBadRequest(body, statusCode, ErrorIdentifiers.REQUEST_INVALID);
		});
	});

	describe("None Unique Data", () => {
		// test("When using an existing username, the request should fail", async () => {
		//   const sessionToken = await testHelper.getUsersessionToken(testUser1.id);
		//
		//   const {body, statusCode} = await testHelper.client
		//     .patch(`/v1/users/${testUser1.id}`)
		//     .set("Authorization", `Bearer ${sessionToken}`)
		//     .send({username: testUser2.username});
		//
		//   expectBadRequest(body, statusCode, ErrorIdentifiers.USER_USERNAME_EXISTS);
		// })

		test("When using an existing email, the request should fail", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`).send({ email: testUser2Unverified.email });

			expectBadRequest(body, statusCode, ErrorIdentifiers.USER_EMAIL_EXISTS);
		});
	});

	describe("Data Validation", () => {
		test("When using an invalid email, the request should fail", async () => {
			const updatesUser = {
				email: "invalid-email",
			};

			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`).send(updatesUser);

			expectBadRequest(body, statusCode);
		});

		test("When using a password that's too short, the request should fail", async () => {
			const updatedUser = {
				password: "hi",
			};

			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`).send(updatedUser);

			expectBadRequest(body, statusCode);
		});

		test("When supplying an empty username, the request should fail", async () => {
			const updatedUser = {
				username: "",
			};

			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`).send(updatedUser);

			expectBadRequest(body, statusCode);
		});

		test("When using a username that's too long, the request should fail", async () => {
			const updatedUser = {
				username: "this-is-a-username-which-is-over-the-maximum",
			};

			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`).send(updatedUser);

			expectBadRequest(body, statusCode);
		});
	});

	describe("Forbidden Fields", () => {
		test("When passing an ID field, the request should fail", async () => {
			const dataToUpdate = {
				id: "a78a9859-314e-44ec-8701-f0c869cfc07f",
			};

			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`).send(dataToUpdate);

			expectBadRequest(body, statusCode);
		});

		test("When passing a createdAt field, the request should fail", async () => {
			const dataToUpdate = {
				createdAt: "2022-07-11T18:20:32.482Z",
			};

			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`).send(dataToUpdate);

			expectBadRequest(body, statusCode);
		});

		test("When passing an updatedAt field, the request should fail", async () => {
			const dataToUpdate = {
				updatedAt: "2022-07-11T18:20:32.482Z",
			};

			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`).send(dataToUpdate);

			expectBadRequest(body, statusCode);
		});

		test("When passing an verifiedAt field, the request should fail", async () => {
			const dataToUpdate = {
				verifiedAt: "2022-07-11T18:20:32.482Z",
			};

			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`).send(dataToUpdate);

			expectBadRequest(body, statusCode);
		});

		test("When passing an firstVerifiedAt field, the request should fail", async () => {
			const dataToUpdate = {
				firstVerifiedAt: "2022-07-11T18:20:32.482Z",
			};

			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			const { body, statusCode } = await testHelper.client.patch(`/v1/users/${testUser1.id}`).set("Authorization", `Bearer ${sessionToken}`).send(dataToUpdate);

			expectBadRequest(body, statusCode);
		});
	});

	describe("Invalid Data", () => {
		test("When supplying invalid JSON data, the request should fail", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			await testMalformedData({
				clientFunction: testHelper.client.patch.bind(testHelper.client),
				endpoint: `/v1/users/${testUser1.id}`,
				sessionToken: sessionToken,
			});
		});

		// describe("When not supplying username as a string, the request should fail", () => {
		//   testInvalidDataTypes({
		//     testHelper: testHelper,
		//     clientMethod: "patch",
		//     user: testUser1,
		//     endpoint: `/v1/users/${testUser1.id}`,
		//     data: {},
		//     testFieldKey: "username",
		//     testCases: [1, 1.5, true, null, {test: "yes"}, [1, 2]]
		//   })
		// })

		// describe("When not supplying email as a string, the request should fail", () => {
		//   testInvalidDataTypes({
		//     testHelper: testHelper,
		//     clientMethod: "patch",
		//     user: testUser1,
		//     endpoint: `/v1/users/${testUser1.id}`,
		//     data: {},
		//     testFieldKey: "email",
		//     testCases: [1, 1.5, true, null, {test: "yes"}, [1, 2]]
		//   })
		// })

		// describe("When not supplying password as a string, the request should fail", () => {
		//   testInvalidDataTypes({
		//     testHelper: testHelper,
		//     clientMethod: "patch",
		//     user: testUser1,
		//     endpoint: `/v1/users/${testUser1.id}`,
		//     data: {},
		//     testFieldKey: "password",
		//     testCases: [1, 1.5, true, null, {test: "yes"}, [1, 2]]
		//   })
		// })

		// describe("When not supplying encryptionSecret as a string, the request should fail", () => {
		//   testInvalidDataTypes({
		//     testHelper: testHelper,
		//     clientMethod: "patch",
		//     user: testUser1,
		//     endpoint: `/v1/users/${testUser1.id}`,
		//     data: {},
		//     testFieldKey: "encryptionSecret",
		//     testCases: [1, 1.5, true, null, {test: "yes"}, [1, 2]]
		//   })
		// })
	});
});
