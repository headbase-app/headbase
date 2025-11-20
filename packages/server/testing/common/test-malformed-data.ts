import { SuperAgentRequest } from "superagent";

import { expectBadRequest } from "./expect-bad-request.js";

export interface TestMalformedDataConfig {
	clientFunction: (url: string) => SuperAgentRequest;
	endpoint: string;
	sessionToken: string;
}

export async function testMalformedData(config: TestMalformedDataConfig) {
	const { body, statusCode } = await config
		.clientFunction(config.endpoint)
		.set("Authorization", `Bearer ${config.sessionToken}`)
		// Explicitly set content type header so an invalid string can be passed as JSON.
		.set("Content-Type", "application/json")
		.send('{field: "value"[]e}');
	expectBadRequest(body, statusCode);
}
