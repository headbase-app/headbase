import {describe, expect, test, beforeAll, beforeEach, afterAll } from "vitest";
import {TestHelper} from "@testing/test-helper.js";
import {ObjectStoreService} from "@services/object-store/object-store.service.js";

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


describe("Object Store Service",() => {
	test("Getting upload URL should work", async () => {
		const objectStore = testHelper.getAppDependency<ObjectStoreService>(ObjectStoreService)

		const uploadUrl = await objectStore.getChunkUploadUrl("vault1", "hash1")

		expect(uploadUrl).toBeTypeOf("string");
		expect(uploadUrl.includes("vault1")).toBe(true)
		expect(uploadUrl.includes("hash1")).toBe(true)
	})

	test("Getting download URL should work", async () => {
		const objectStore = testHelper.getAppDependency<ObjectStoreService>(ObjectStoreService)

		const downloadUrl = await objectStore.getChunkDownloadUrl("vault1", "hash1")

		expect(downloadUrl).toBeTypeOf("string");
		expect(downloadUrl.includes("vault1")).toBe(true)
		expect(downloadUrl.includes("hash1")).toBe(true)
	})
})
