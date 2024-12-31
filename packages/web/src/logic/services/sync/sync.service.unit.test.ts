import {test, describe} from "vitest";
import {SyncService, SyncServiceConfig} from "./sync.service.ts";
import {DeviceContext} from "../database/adapter.ts";
import {MockPlatformAdapter} from "../../../../tests/mock-platform-adapter/mock-platform-adapter.ts";


describe("compareSnapshots should return the correct sync actions", async () => {
	test("empty snapshots should return no sync actions", async ({expect}) => {
		const deviceContext: DeviceContext = {
			id: "5f95f173-572c-4b67-a697-b4474f880ae9"
		}
		const syncServiceConfig: SyncServiceConfig = {
			platformAdapter: new MockPlatformAdapter({context: deviceContext})
		}
		const syncService = new SyncService(syncServiceConfig);

		const result = syncService.compareSnapshots({
			fields: {},
			fieldsVersions: {},
			contentTypes: {},
			contentTypesVersions: {},
			contentItems: {},
			contentItemsVersions: {},
			views: {},
			viewsVersions: {},
		}, {
			fields: {},
			fieldsVersions: {},
			contentTypes: {},
			contentTypesVersions: {},
			contentItems: {},
			contentItemsVersions: {},
			views: {},
			viewsVersions: {},
		})

		expect(result.length).toEqual(0)
	})

	test("identical snapshots with deletions should result in purge actions", async ({expect}) => {
		const deviceContext: DeviceContext = {
			id: "5f95f173-572c-4b67-a697-b4474f880ae9"
		}
		const syncServiceConfig: SyncServiceConfig = {
			platformAdapter: new MockPlatformAdapter({context: deviceContext})
		}
		const syncService = new SyncService(syncServiceConfig);

		const result = syncService.compareSnapshots({
			fields: {
				"1": false,
				"2": false,
				"3": false,
				"4": true,
				"5": false,
				"6": true,
			},
			fieldsVersions: {},
			contentTypes: {},
			contentTypesVersions: {},
			contentItems: {},
			contentItemsVersions: {},
			views: {},
			viewsVersions: {},
		}, {
			fields: {
				"1": false,
				"2": false,
				"3": false,
				"4": true,
				"5": false,
				"6": true,
			},
			fieldsVersions: {},
			contentTypes: {},
			contentTypesVersions: {},
			contentItems: {},
			contentItemsVersions: {},
			views: {},
			viewsVersions: {},
		})

		expect(result.length).toEqual(2)

		// todo: test that both actions are purge actions for "4" and "6"
	})

	test("different snapshots should result in the correct sync actions", async ({expect}) => {
		const deviceContext: DeviceContext = {
			id: "5f95f173-572c-4b67-a697-b4474f880ae9"
		}
		const syncServiceConfig: SyncServiceConfig = {
			platformAdapter: new MockPlatformAdapter({context: deviceContext})
		}
		const syncService = new SyncService(syncServiceConfig);

		const result = syncService.compareSnapshots({
			fields: {
				"1": false,
				"2": false,
				"3": false,
				"4": true,
				"5": true,
			},
			fieldsVersions: {},
			contentTypes: {},
			contentTypesVersions: {},
			contentItems: {},
			contentItemsVersions: {},
			views: {},
			viewsVersions: {},
		}, {
			fields: {
				"4": false,
				"5": true,
				"6": false,
				"7": false,
				"8": true,
			},
			fieldsVersions: {},
			contentTypes: {},
			contentTypesVersions: {},
			contentItems: {},
			contentItemsVersions: {},
			views: {},
			viewsVersions: {},
		})

		expect(result.length).toEqual(7)
	})
})
