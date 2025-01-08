import {test, describe} from "vitest";
import {SyncService} from "./sync.service.ts";
import {DeviceContext} from "../interfaces.ts";
import {MockEventsService} from "../../../../tests/mock-services/mock-events.service.ts";
import {compareSnapshots} from "./sync-logic.ts";


describe("compareSnapshots should return the correct sync actions", async () => {
	test("empty snapshots should return no sync actions", async ({expect}) => {
		const result = compareSnapshots("4b564b07-038c-4984-9961-224325526230", {
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
		const result = compareSnapshots('7aae325a-d16d-4e0c-b18c-a3988533bc62', {
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
		const result = compareSnapshots("b9578635-47c3-454d-9371-a68cbdefaac0", {
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
