import { describe, expect, test, beforeAll, beforeEach, afterAll } from "@jest/globals";

import { ErrorIdentifiers, Roles } from "@headbase-app/contracts";
import { TestHelper } from "@testing/test-helper";
import { expectBadRequest } from "@testing/common/expect-bad-request";
import { testMissingField } from "@testing/common/test-missing-field";
import { testMalformedData } from "@testing/common/test-malformed-data";
import { testInvalidDataTypes } from "@testing/common/test-invalid-data-types";
import { exampleUser1, testAdminUser1, testUser1 } from "@testing/data/users";
import { expectForbidden } from "@testing/common/expect-forbidden";

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

describe("Create User - /v1/users [POST]", () => {
	describe("Success Cases", () => {
		test("When adding a valid new user, the new user should be added & returned", async () => {
			const { body, statusCode } = await testHelper.client.post("/v1/users").send(exampleUser1);

			expect(statusCode).toEqual(201);
			expect(body).toEqual(
				expect.objectContaining({
					user: {
						id: expect.any(String),
						email: exampleUser1.email,
						displayName: exampleUser1.displayName,
						verifiedAt: null,
						firstVerifiedAt: null,
						role: Roles.Enum.user,
						createdAt: expect.any(String),
						updatedAt: expect.any(String),
					},
					sessionToken: expect.any(String),
				}),
			);
		});

		test.todo("When adding a valid new user, the returned access and refresh tokens should be valid");

		test("When using a password that's 12 characters, the new user should be added & returned", async () => {
			const newUser = {
				...exampleUser1,
				password: "password1234!",
			};

			const { statusCode } = await testHelper.client.post("/v1/users").send(newUser);

			expect(statusCode).toEqual(201);
		});

		// test("When using a username that's 1 character, the new user should be added & returned", async () => {
		//   const newUser = {
		//     ...exampleUser1,
		//     username: "a"
		//   }
		//
		//   const {body, statusCode} = await testHelper.client
		//     .post("/v1/users")
		//     .send(newUser);
		//
		//   expect(statusCode).toEqual(201);
		//   expect(body).toEqual(expect.objectContaining({
		//     user: {
		//       id: expect.any(String),
		//       email: newUser.email,
		//       isVerified: false,
		//       encryptionSecret: newUser.encryptionSecret,
		//       createdAt: expect.any(String),
		//       updatedAt: expect.any(String)
		//     },
		//     sessionToken: expect.any(String),
		//     refreshToken: expect.any(String)
		//   }))
		// })

		// test("When using a username that's 20 characters, the new user should be added & returned", async () => {
		//   const newUser = {
		//     ...exampleUser1,
		//     username: "qwertyuiopasdfghjklz"
		//   }
		//
		//   const {body, statusCode} = await testHelper.client
		//     .post("/v1/users")
		//     .send(newUser);
		//
		//   expect(statusCode).toEqual(201);
		//   expect(body).toEqual(expect.objectContaining({
		//     user: {
		//       id: expect.any(String),
		//       email: newUser.email,
		//       isVerified: false,
		//       encryptionSecret: newUser.encryptionSecret,
		//       createdAt: expect.any(String),
		//       updatedAt: expect.any(String)
		//     },
		//     sessionToken: expect.any(String),
		//     refreshToken: expect.any(String)
		//   }))
		// })
	});

	describe("None Unique Data", () => {
		test("When using an existing email, the request should fail", async () => {
			const newUser = {
				...exampleUser1,
				email: testUser1.email,
			};

			const { body, statusCode } = await testHelper.client.post("/v1/users").send(newUser);

			expectBadRequest(body, statusCode, ErrorIdentifiers.USER_EMAIL_EXISTS);
		});
	});

	describe("Data Validation", () => {
		test("When using an invalid email, the request should fail", async () => {
			const newUser = {
				...exampleUser1,
				email: "invalid-email",
			};

			const { body, statusCode } = await testHelper.client.post("/v1/users").send(newUser);

			expectBadRequest(body, statusCode);
		});

		// todo: add boundary tests for password min length
		test("When using a password that's too short, the request should fail", async () => {
			const newUser = {
				...exampleUser1,
				password: "hi",
			};

			const { body, statusCode } = await testHelper.client.post("/v1/users").send(newUser);

			expectBadRequest(body, statusCode);
		});

		// todo: add max length to email schema and re-add this test
		// test("When using a email that's too long, the request should fail", async () => {
		//   const newUser = {
		//     ...exampleUser1,
		//     email: "this-is-a-username-which-is-over-the-maximum"
		//   }
		//
		//   const {body, statusCode} = await testHelper.client
		//     .post("/v1/users")
		//     .send(newUser);
		//
		//   expectBadRequest(body, statusCode)
		// })
	});

	describe("Required Fields", () => {
		test("When not supplying an email, the request should fail", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			await testMissingField({
				clientFunction: testHelper.client.post.bind(testHelper.client),
				sessionToken: sessionToken,
				endpoint: "/v1/users",
				data: exampleUser1,
				testFieldKey: "email",
			});
		});

		test("When not supplying a password, the request should fail", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			await testMissingField({
				clientFunction: testHelper.client.post.bind(testHelper.client),
				sessionToken: sessionToken,
				endpoint: "/v1/users",
				data: exampleUser1,
				testFieldKey: "password",
			});
		});

		test("When not supplying a displayName, the request should fail", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			await testMissingField({
				clientFunction: testHelper.client.post.bind(testHelper.client),
				sessionToken: sessionToken,
				endpoint: "/v1/users",
				data: exampleUser1,
				testFieldKey: "displayName",
			});
		});
	});

	describe("Forbidden Fields", () => {
		test("When passing an ID field, the request should fail", async () => {
			const newUser = {
				...exampleUser1,
				id: "a78a9859-314e-44ec-8701-f0c869cfc07f",
			};

			const { body, statusCode } = await testHelper.client.post("/v1/users").send(newUser);

			expectBadRequest(body, statusCode);
		});

		test("When passing a createdAt field, the request should fail", async () => {
			const newUser = {
				...exampleUser1,
				createdAt: "2022-07-11T18:20:32.482Z",
			};

			const { body, statusCode } = await testHelper.client.post("/v1/users").send(newUser);

			expectBadRequest(body, statusCode);
		});

		test("When passing an updatedAt field, the request should fail", async () => {
			const newUser = {
				...exampleUser1,
				updatedAt: "2022-07-11T18:20:32.482Z",
			};

			const { body, statusCode } = await testHelper.client.post("/v1/users").send(newUser);

			expectBadRequest(body, statusCode);
		});

		test("When passing a verifiedAt field, the request should fail", async () => {
			const newUser = {
				...exampleUser1,
				verifiedAt: "2022-07-11T18:20:32.482Z",
			};

			const { body, statusCode } = await testHelper.client.post("/v1/users").send(newUser);

			expectBadRequest(body, statusCode);
		});

		test("When passing a firstVerifiedAt field, the request should fail", async () => {
			const newUser = {
				...exampleUser1,
				firstVerifiedAt: "2022-07-11T18:20:32.482Z",
			};

			const { body, statusCode } = await testHelper.client.post("/v1/users").send(newUser);

			expectBadRequest(body, statusCode);
		});

		test("When passing a role field, the request should fail", async () => {
			const newUser = {
				...exampleUser1,
				role: "admin",
			};

			const { body, statusCode } = await testHelper.client.post("/v1/users").send(newUser);

			expectBadRequest(body, statusCode);
		});
	});

	describe("Invalid Data", () => {
		test("When supplying invalid JSON data, the request should fail", async () => {
			const sessionToken = await testHelper.getSessionToken(testUser1.id);

			await testMalformedData({
				clientFunction: testHelper.client.post.bind(testHelper.client),
				sessionToken: sessionToken,
				endpoint: "/v1/users",
			});
		});

		describe("When not supplying email as a string, the request should fail", () => {
			testInvalidDataTypes({
				testHelper: testHelper,
				req: {
					clientMethod: "post",
					endpoint: "/v1/users",
					initialData: exampleUser1,
				},
				auth: {
					userId: testUser1.id,
				},
				testFieldKey: "email",
				testCases: [1, 1.5, true, null, undefined, { test: "yes" }, [1, 2]],
			});
		});

		describe("When not supplying password as a string, the request should fail", () => {
			testInvalidDataTypes({
				testHelper: testHelper,
				req: {
					clientMethod: "post",
					endpoint: "/v1/users",
					initialData: exampleUser1,
				},
				auth: {
					userId: testUser1.id,
				},
				testFieldKey: "password",
				testCases: [1, 1.5, true, null, undefined, { test: "yes" }, [1, 2]],
			});
		});

		describe("When not supplying displayName as a string, the request should fail", () => {
			testInvalidDataTypes({
				testHelper: testHelper,
				req: {
					clientMethod: "post",
					endpoint: "/v1/users",
					initialData: exampleUser1,
				},
				auth: {
					userId: testUser1.id,
				},
				testFieldKey: "displayName",
				testCases: [1, 1.5, true, null, undefined, { test: "yes" }, [1, 2]],
			});
		});
	});

	describe("Registration Enabled", () => {
		test("When registration is disabled, adding a new user should fail", async () => {
			const sessionToken = await testHelper.getSessionToken(testAdminUser1.id);

			// Update settings to disable registration
			await testHelper.client.patch("/v1/server/settings").set("Authorization", `Bearer ${sessionToken}`).send({
				registrationEnabled: false,
			});

			// Attempt to create a user, which should now fail
			const { body, statusCode } = await testHelper.client.post("/v1/users").send(exampleUser1);
			expectForbidden(body, statusCode, ErrorIdentifiers.USER_REGISTRATION_DISABLED);
		});
	});
});
