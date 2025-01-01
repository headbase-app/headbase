import {test, describe} from "vitest";
import {SyncService} from "./sync.service.ts";
import {DeviceContext} from "../database/interfaces.ts";
import {MockEventsService} from "../../../../tests/mock-services/mock-events.service.ts";


describe("compareSnapshots should return the correct sync actions", async () => {
	test("empty snapshots should return no sync actions", async ({expect}) => {
		const deviceContext: DeviceContext = {id: "5f95f173-572c-4b67-a697-b4474f880ae9"}
		const eventService = new MockEventsService({context: deviceContext});
		const syncService = new SyncService(eventService);
		// todo: setup and cleanup sync service outside of individual tests?

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
		const deviceContext: DeviceContext = {id: "5f95f173-572c-4b67-a697-b4474f880ae9"}
		const eventService = new MockEventsService({context: deviceContext});
		const syncService = new SyncService(eventService);
		// todo: setup and cleanup sync service outside of individual tests?

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
		const deviceContext: DeviceContext = {id: "5f95f173-572c-4b67-a697-b4474f880ae9"}
		const eventService = new MockEventsService({context: deviceContext});
		const syncService = new SyncService(eventService);
		// todo: setup and cleanup sync service outside of individual tests?

		const result = syncService.compareSnapshots({
			fields: {
				"local-only-1": false,
				"local-only-2": false,
				"local-only-3": false,
				"local-only-deleted-1": true,
				"all-1": false,
				"all-deleted-1": true,
				"delete-on-server": false,
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
				"server-only-1": false,
				"server-only-2": false,
				"server-only-deleted-1": true,
				"all-1": false,
				"all-deleted-1": true,
				"delete-on-server": true,
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
