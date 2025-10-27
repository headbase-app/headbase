import { describe, expect, test } from "@jest/globals";
import { ObjectStoreService } from "@services/object-store/object-store.service";
import { Test } from "@nestjs/testing";
import { ConfigService } from "@services/config/config.service";

describe("Object Store Service", () => {
	test("Getting upload URL should work", async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [ObjectStoreService, ConfigService],
		}).compile();
		const objectStore = moduleRef.get(ObjectStoreService);

		const uploadUrl = await objectStore.getChunkUploadUrl("vault1", "hash1");

		expect(uploadUrl).toEqual(expect.any(String));
		expect(uploadUrl.includes("vault1")).toBe(true);
		expect(uploadUrl.includes("hash1")).toBe(true);
	});

	test("Getting download URL should work", async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [ObjectStoreService, ConfigService],
		}).compile();
		const objectStore = moduleRef.get(ObjectStoreService);

		const downloadUrl = await objectStore.getChunkDownloadUrl("vault1", "hash1");

		expect(downloadUrl).toEqual(expect.any(String));
		expect(downloadUrl.includes("vault1")).toBe(true);
		expect(downloadUrl.includes("hash1")).toBe(true);
	});
});
