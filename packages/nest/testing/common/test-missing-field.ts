import { expectBadRequest } from "./expect-bad-request.js";
import { SuperAgentRequest } from "superagent";

export interface TestInvalidDataTypesConfig {
	clientFunction: (url: string) => SuperAgentRequest;
	endpoint: string;
	accessToken?: string;
	data: object;
	testFieldKey: string;
}

export async function testMissingField(config: TestInvalidDataTypesConfig) {
	const testData = JSON.parse(JSON.stringify(config.data));
	delete testData[config.testFieldKey];

	const req: SuperAgentRequest = config.clientFunction(config.endpoint);
	if (config.accessToken) {
		req.set("Authorization", `Bearer ${config.accessToken}`);
	}

	const { body, statusCode } = await req.send(testData);

	expectBadRequest(body, statusCode);
}
