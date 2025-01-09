import {describe, expect, test, beforeAll, beforeEach, afterAll } from "vitest";

import {ErrorIdentifiers} from "@headbase-app/common";

import {HttpStatusCodes} from "@common/http-status-codes.js";

import {TestHelper} from "@testing/test-helper.js";
import {expectUnauthorized} from "@testing/common/expect-unauthorized.js";
import {expectForbidden} from "@testing/common/expect-forbidden.js";
import {expectNotFound} from "@testing/common/expect-not-found.js";
import {testAdminUser1, testAdminUser2Unverified, testUser1} from "@testing/data/users.js";
import {testAdminUser1Vault1, testUser1Vault1} from "@testing/data/vaults.js";
import {expectBadRequest} from "@testing/common/expect-bad-request.js";

const testHelper = new TestHelper();
beforeAll(async () => {
  await testHelper.beforeAll();
});
afterAll(async () => {
  await testHelper.afterAll()
});
beforeEach(async () => {
  await testHelper.beforeEach()
});

// todo: add tests that snapshot data is accurate, this could involve checking the item totals and picking some random items in the results.

describe("Retrieve Snapshot - /v1/vaults/:vaultId/snapshot [GET]", () => {

  // Testing success cases/happy paths work.
  describe("Success Cases", () => {

    test("Given user with `user` role, When retrieving their own vault snapshot, Then the snapshot should be returned", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser1.id);

      const {body, statusCode} = await testHelper.client
        .get(`/v1/vaults/${testUser1Vault1.id}/snapshot`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect(statusCode).toEqual(HttpStatusCodes.OK);
      expect(body).toEqual(expect.objectContaining({
				vault: expect.objectContaining({
					updatedAt: expect.any(String),
				}),
				items: expect.any(Array)
      }))
    });

    // todo: should be moved to different test section?
    test("Given user with `user` role, When retrieving vault snapshot that doesn't exist, Then response should be '404 - not found'", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser1.id);

      const {body, statusCode} = await testHelper.client
        .get("/v1/vaults/99b8ffa1-411e-4cbc-bda0-ce5cb0749459/snapshot")
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expectNotFound(body, statusCode, ErrorIdentifiers.VAULT_NOT_FOUND);
    });

    test("Given user with 'admin' role, When retrieving their own vault snapshot, Then the snapshot should be returned", async () => {
      const accessToken = await testHelper.getUserAccessToken(testAdminUser1.id);

      const {body, statusCode} = await testHelper.client
        .get(`/v1/vaults/${testAdminUser1Vault1.id}/snapshot`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect(statusCode).toEqual(HttpStatusCodes.OK);
			expect(body).toEqual(expect.objectContaining({
				vault: expect.objectContaining({
					updatedAt: expect.any(String),
				}),
				items: expect.any(Array)
			}))
    });

    test("Given user with 'admin' role, When retrieving vault snapshot owned by different user, Then the snapshot should be returned", async () => {
      const accessToken = await testHelper.getUserAccessToken(testAdminUser1.id);

      const {body, statusCode} = await testHelper.client
        .get(`/v1/vaults/${testUser1Vault1.id}/snapshot`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect(statusCode).toEqual(HttpStatusCodes.OK);
			expect(body).toEqual(expect.objectContaining({
				vault: expect.objectContaining({
					updatedAt: expect.any(String),
				}),
				items: expect.any(Array)
			}))
    });
  })

  // Testing auth & user permissions work.
  describe("Authentication & Permissions", () => {
    test("Given user that isn't authenticated, When retrieving a vault snapshot, Then response should be '401 - unauthorised'", async () => {
      const {body, statusCode} = await testHelper.client
        .get(`/v1/vaults/${testUser1Vault1.id}/snapshot`)
        .send();

      expectUnauthorized(body, statusCode);
    });

    test("Given user with 'user' role, When retrieving vault snapshot owned by different user, Then response should be '403 - forbidden'", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser1.id);

      const {body, statusCode} = await testHelper.client
        .get(`/v1/vaults/${testAdminUser1Vault1.id}/snapshot`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expectForbidden(body, statusCode);
    });

    test("Given unverified admin, When retrieving a vault snapshot, Then response should be '403 - forbidden'", async () => {
      const accessToken = await testHelper.getUserAccessToken(testAdminUser2Unverified.id);

      const {body, statusCode} = await testHelper.client
          .get(`/v1/vaults/${testUser1Vault1.id}/snapshot`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send();

      expectForbidden(body, statusCode, ErrorIdentifiers.AUTH_NOT_VERIFIED);
    });
  })

  describe("Logical Validation", () => {
    test("When retrieving vault snapshot with invalid id, Then response should be '400 - bad request'", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser1.id);

      const {body, statusCode} = await testHelper.client
        .get("/v1/vaults/random/snapshot")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expectBadRequest(body, statusCode);
    });
  })
})
