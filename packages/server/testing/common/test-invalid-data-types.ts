import { test } from "@jest/globals";

import { expectBadRequest } from "./expect-bad-request";
import { TestHelper } from "../test-helper";

export interface TestInvalidDataTypesConfig {
	testFieldKey: string;
	testCases: any[];
	req: {
		clientMethod: "get" | "post" | "patch" | "delete";
		endpoint: string;
		initialData: object;
	};
	auth?: {
		userId: string;
	};
	testHelper: TestHelper;
}

export function testInvalidDataTypes(config: TestInvalidDataTypesConfig) {
	test.each(config.testCases)(`When ${config.testFieldKey} is %s, Then response should be 'HTTP 400 - bad request'`, async (testCase) => {
		const testData = {
			...config.req.initialData,
			[config.testFieldKey]: testCase,
		};

		const req = config.testHelper.client[config.req.clientMethod](config.req.endpoint);
		if (config.auth) {
			const sessionToken = await config.testHelper.getSessionToken(config.auth.userId);
			req.set("Authorization", `Bearer ${sessionToken}`);
		}

		const { body, statusCode } = await req.send(testData);

		expectBadRequest(body, statusCode);
	});
}
