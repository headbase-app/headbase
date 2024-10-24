import {describe, expect, test, beforeAll, beforeEach, afterAll } from "vitest";

import {ErrorIdentifiers} from "@headbase-app/common";

import {HttpStatusCodes} from "@common/http-status-codes.js";

import {TestHelper} from "@testing/test-helper.js";
import {expectUnauthorized} from "@testing/common/expect-unauthorized.js";
import {expectForbidden} from "@testing/common/expect-forbidden.js";
import {testAdminUser1, testUser1} from "@testing/data/users.js";
import {testAdminUser1Vault1, testUser1Vault1} from "@testing/data/vaults.js";
import {expectBadRequest} from "@testing/common/expect-bad-request.js";
import {expectNotFound} from "@testing/common/expect-not-found.js";

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


describe("Delete Profile - /v1/vaults/:userId [DELETE]",() => {

  // Testing success cases/happy paths work.
  describe("Success Cases", () => {

    test("Given user with 'user' role, When deleting their own vault, Then the vault should be deleted", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser1.id);

      const {statusCode} = await testHelper.client
        .delete(`/v1/vaults/${testUser1Vault1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send();
      expect(statusCode).toEqual(HttpStatusCodes.OK);

      const {statusCode: checkStatusCode} = await testHelper.client
        .get(`/v1/vaults/${testUser1Vault1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send();
      expect(checkStatusCode).toEqual(HttpStatusCodes.NOT_FOUND);
    });

    test("Given user with 'admin' role, When deleting their own vault, Then the vault should be deleted", async () => {
      const accessToken = await testHelper.getUserAccessToken(testAdminUser1.id);

      const {statusCode} = await testHelper.client
          .delete(`/v1/vaults/${testAdminUser1Vault1.id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send();
      expect(statusCode).toEqual(HttpStatusCodes.OK);

      const {statusCode: checkStatusCode} = await testHelper.client
          .get(`/v1/vaults/${testAdminUser1Vault1.id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send();
      expect(checkStatusCode).toEqual(HttpStatusCodes.NOT_FOUND);
    });

    test("Given user with 'admin' role, When deleting a different user vault, Then the vault should be deleted", async () => {
      const accessToken = await testHelper.getUserAccessToken(testAdminUser1.id);

      const {statusCode} = await testHelper.client
          .delete(`/v1/vaults/${testUser1Vault1.id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send();
      expect(statusCode).toEqual(HttpStatusCodes.OK);

      const {statusCode: checkStatusCode} = await testHelper.client
          .get(`/v1/vaults/${testUser1Vault1.id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send();
      expect(checkStatusCode).toEqual(HttpStatusCodes.NOT_FOUND);
    });
  })

  // Testing auth & user permissions work.
  describe("Authentication & Permissions", () => {
    test("Given unauthenticated user, When deleting vault, Then response should be '401 - unauthorised'", async () => {
      const {body, statusCode} = await testHelper.client
          .delete(`/v1/vaults/${testUser1Vault1.id}`)
          .send();

      expectUnauthorized(body, statusCode);
    });

    test("Given user with 'user' role, When deleting a different users vault, Then response should be '403 - forbidden'", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser1.id);

      const {statusCode, body} = await testHelper.client
          .delete(`/v1/vaults/${testAdminUser1Vault1.id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send();

      expectForbidden(body, statusCode);
    });
  })

  describe("Logical Validation", () => {
    test("When deleting vault with invalid id, Then response should be '400 - bad request'", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser1.id);

      const {body, statusCode} = await testHelper.client
        .delete("/v1/vaults/random")
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expectBadRequest(body, statusCode);
    });

    test("When attempting to delete a none existent vault, Then response should be '404 - not found'", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser1.id);

      const {body, statusCode} = await testHelper.client
        .delete("/v1/vaults/b283f9e5-f386-4503-abc3-a31729f333e1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expectNotFound(body, statusCode, ErrorIdentifiers.VAULT_NOT_FOUND);
    });
  })
})
