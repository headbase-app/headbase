import {describe, expect, test, beforeAll, beforeEach, afterAll } from "vitest";

import {ErrorIdentifiers} from "@headbase-app/common";

import {TestHelper} from "@testing/test-helper.js";
import {testAdminUser2Unverified, testUser1, testUser2Unverified} from "@testing/data/users.js";
import {exampleVault1} from "@testing/data/vaults.js";
import {expectForbidden} from "@testing/common/expect-forbidden.js";

const testHelper = new TestHelper();
beforeAll(async () => {
  await testHelper.beforeAll()
})
afterAll(async () => {
  await testHelper.afterAll()
});
beforeEach(async () => {
  await testHelper.beforeEach()
});


describe("Email Verification - /v1/auth/verify-email [GET, POST]",() => {
  // Testing success cases/happy paths work.
  describe("Success Cases", () => {

    test("authenticated user can request email verification", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser2Unverified.id);

      const {statusCode} = await testHelper.client
          .get("/v1/auth/verify-email")
          .set("Authorization", `Bearer ${accessToken}`)
          .send();

      expect(statusCode).toEqual(200);
    });

    test("authenticated admin can request email verification", async () => {
      const accessToken = await testHelper.getUserAccessToken(testAdminUser2Unverified.id);

      const {statusCode} = await testHelper.client
          .get("/v1/auth/verify-email")
          .set("Authorization", `Bearer ${accessToken}`)
          .send();

      expect(statusCode).toEqual(200);
    });

    test("authenticated user can verify their email", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser2Unverified.id);
      const token = await testHelper.getEmailVerificationToken(testUser2Unverified.id)

      const {statusCode, body} = await testHelper.client
          .post("/v1/auth/verify-email")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            token
          });

      expect(statusCode).toEqual(200);
      expect(body).toEqual(expect.objectContaining({
        user: {
          id: testUser2Unverified.id,
          email: testUser2Unverified.email,
          displayName: testUser2Unverified.displayName,
          verifiedAt: expect.any(String),
          firstVerifiedAt: expect.any(String),
          role: testUser2Unverified.role,
          createdAt: testUser2Unverified.createdAt,
          updatedAt: expect.any(String)
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }
      }))
    });

    test("authenticated admin can verify their email", async () => {
      const accessToken = await testHelper.getUserAccessToken(testAdminUser2Unverified.id);
      const token = await testHelper.getEmailVerificationToken(testAdminUser2Unverified.id)

      const {statusCode, body} = await testHelper.client
          .post("/v1/auth/verify-email")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            token
          });

      expect(statusCode).toEqual(200);
      expect(body).toEqual(expect.objectContaining({
        user: {
          id: testAdminUser2Unverified.id,
          email: testAdminUser2Unverified.email,
          displayName: testAdminUser2Unverified.displayName,
          verifiedAt: expect.any(String),
          firstVerifiedAt: expect.any(String),
          role: testAdminUser2Unverified.role,
          createdAt: testAdminUser2Unverified.createdAt,
          updatedAt: expect.any(String)
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }
      }))
    });

    test("user can perform actions once verified ", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser2Unverified.id);
      const verificationToken = await testHelper.getEmailVerificationToken(testUser2Unverified.id)

      // Initial attempt to create vault should fail as unverified (technically a repeat test, but included here to illustrate scenario)
      const {statusCode: initialCreateStatusCode, body: initialCreateBody} = await testHelper.client
          .post("/v1/vaults")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            ...exampleVault1,
            ownerId: testUser1.id,
          });
      expectForbidden(initialCreateBody, initialCreateStatusCode, ErrorIdentifiers.AUTH_NOT_VERIFIED)

      // Now verify user
      const {statusCode: verifyStatusCode, body: verifyBody} = await testHelper.client
          .post("/v1/auth/verify-email")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            token: verificationToken
          });
      expect(verifyStatusCode).toEqual(200);

      // Now user should be able to create vault
      const {statusCode: verifiedCreateStatusCode} = await testHelper.client
          .post("/v1/vaults")
          .set("Authorization", `Bearer ${verifyBody.tokens.accessToken}`)
          .send({
            ...exampleVault1,
            ownerId: testUser2Unverified.id,
          });
      expect(verifiedCreateStatusCode).toEqual(201);
    });

  })

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
})
