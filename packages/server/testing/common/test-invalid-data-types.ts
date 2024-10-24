import { test } from "vitest"

import {expectBadRequest} from "./expect-bad-request.js";
import {TestHelper} from "../test-helper.js";

export interface TestInvalidDataTypesConfig {
  testFieldKey: string,
  testCases: any[],
  req: {
    clientMethod: "get" | "post" | "patch" | "delete",
    endpoint: string,
    initialData: object,
  },
  auth?: {
    userId: string,
  },
  testHelper: TestHelper
}

export function testInvalidDataTypes(config: TestInvalidDataTypesConfig) {
  test.each(config.testCases)(`When ${config.testFieldKey} is %s, Then response should be 'HTTP 400 - bad request'`, async testCase => {
    const testData = {
      ...config.req.initialData,
      [config.testFieldKey]: testCase
    };

    const req = config.testHelper.client[config.req.clientMethod](config.req.endpoint)
    if (config.auth) {
      const accessToken = await config.testHelper.getUserAccessToken(config.auth.userId);
      req.set("Authorization", `Bearer ${accessToken}`)
    }

    const {body, statusCode} = await req.send(testData);

    expectBadRequest(body, statusCode);
  })
}
