import { afterAll, beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import { createApp } from "../../../create-app";
import { TestHelper } from "@testing/test-helper";

// let app: INestApplication<App>;
// beforeEach(async () => {
// 	app = await createApp();
// 	await app.init();
// });

const testHelper = new TestHelper();
beforeAll(async () => {
	await testHelper.beforeAll();
});
afterAll(async () => {
	await testHelper.afterAll();
});
beforeEach(async () => {
	await testHelper.beforeEach();
});

describe("App test", () => {
	test("/ (GET)", async () => {
		const { body, statusCode } = await testHelper.client.get("/");

		// const client = request(app.getHttpServer());
		// const response = await client.get("/");

		expect(body).toEqual(expect.objectContaining({ message: expect.any(String) }));
	});
});
