import {describe, expect, test, beforeAll, beforeEach, afterAll } from "vitest";

import {sign} from "jsonwebtoken";

import {ErrorIdentifiers} from "@headbase-app/common";

import {TestHelper} from "@testing/test-helper.js";
import {testUser1} from "@testing/data/users.js";
import {expectUnauthorized} from "@testing/common/expect-unauthorized.js";
import {expectBadRequest} from "@testing/common/expect-bad-request.js";
import {testInvalidDataTypes} from "@testing/common/test-invalid-data-types.js";
import {EnvironmentService} from "@services/environment/environment.service.js";

// todo: remove direct use of DI container?

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


describe("Refresh Auth",() => {
  describe("Success Cases", () => {
    test("When supplying a valid refreshToken, an accessToken and refreshToken should be returned", async () => {
      const { refreshToken } = await testHelper.getUserTokens(testUser1.id);

      const {body, statusCode} = await testHelper.client
        .post("/v1/auth/refresh")
        .send({
          refreshToken
        });

      expect(statusCode).toEqual(200);
      expect(body).toEqual(expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String)
      }))
    })
  })

  describe("Token Revocation", () => {
    test("After a successful refresh, the previous refreshToken should be invalid", async () => {
      const { refreshToken } = await testHelper.getUserTokens(testUser1.id);

      // Call a refresh to get new access & refresh token
      const {statusCode} = await testHelper.client
        .post("/v1/auth/refresh")
        .send({
          refreshToken
        });

      expect(statusCode).toEqual(200);

      // Repeat the refresh, this time it should fail as the refreshToken should be blacklisted
      const {body: retryBody, statusCode: retryStatusCode} = await testHelper.client
        .post("/v1/auth/refresh")
        .send({
          refreshToken
        });

      expectUnauthorized(retryBody, retryStatusCode, ErrorIdentifiers.AUTH_TOKEN_INVALID);
    })
  })

  describe("Invalid Data", () => {
    test("When supplying an incorrectly signed refreshToken, the request should fail", async () => {
      //  Create a token with the expected payload but signed wrong
      const refreshToken = sign(
        {userId: testUser1.id, type: "refreshToken"},
        "aergsethsrjsrj",
        {expiresIn: "1h"}
      );

      const {body, statusCode} = await testHelper.client
        .post("/v1/auth/refresh")
        .send({
          refreshToken
        });

      expectUnauthorized(body, statusCode, ErrorIdentifiers.AUTH_TOKEN_INVALID);
    })

    test("When supplying an invalid refreshToken, the request should fail", async () => {
      const {body, statusCode} = await testHelper.client
        .post("/v1/auth/refresh")
        .send({
          refreshToken: "djbgdklhbghlg"
        });

      expectBadRequest(body, statusCode);
    })

    test("When supplying an expired refreshToken, the request should fail", async () => {
      // Create an expired token with the correct payload & sign it correctly
      const envService = testHelper.getAppDependency<EnvironmentService>(EnvironmentService);
      const refreshToken = sign(
        {userId: testUser1.id, type: "refreshToken"},
        envService.vars.auth.refreshToken.secret,
        {expiresIn: 0}
      );

      const {body, statusCode} = await testHelper.client
        .post("/v1/auth/refresh")
        .send({
          refreshToken
        });

      expectUnauthorized(body, statusCode, ErrorIdentifiers.AUTH_TOKEN_INVALID);
    })

    describe("When not supplying refreshToken as a string, the request should fail", () => {
      testInvalidDataTypes({
        testHelper: testHelper,
        req: {
          clientMethod: "post",
          endpoint: "/v1/auth/refresh",
          initialData: {},
        },
        testFieldKey: "refreshToken",
        testCases: [1, 1.5, true, null, undefined, {test: "yes"}, [1, 2]]
      })
    })
  })
})
