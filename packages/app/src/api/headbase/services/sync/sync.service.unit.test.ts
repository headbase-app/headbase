import {test, describe} from "vitest";
import {compareSnapshots} from "./sync-logic.ts";


describe("compareSnapshots should return the correct sync actions", async () => {
	test("given empty snapshots with matching vaults, no sync actions returned", async ({expect}) => {
		const result = compareSnapshots("4b564b07-038c-4984-9961-224325526230", {}, {})

		expect(result.length).toEqual(0)
	})

	test("identical snapshots with deletions should result in no actions", async ({expect}) => {
		const result = compareSnapshots("4b564b07-038c-4984-9961-224325526230",
			{
				"1": false,
				"2": false,
				"3": false,
				"4": true,
				"5": false,
				"6": true,
			},
			{
				"1": false,
				"2": false,
				"3": false,
				"4": true,
				"5": false,
				"6": true,
			})

		expect(result.length).toEqual(0)
	})

	test("different snapshots should result in the correct sync actions", async ({expect}) => {
		const result = compareSnapshots("4b564b07-038c-4984-9961-224325526230",
			{
				"local-only-1": false,
				"local-only-2": false,
				"local-only-3": false,
				"local-only-deleted-1": true,
				"all-1": false,
				"all-deleted-1": true,
				"delete-on-server": false,
			},
			{
				"server-only-1": false,
				"server-only-2": false,
				"server-only-deleted-1": true,
				"all-1": false,
				"all-deleted-1": true,
				"delete-on-server": true,
			})

		expect(result.length).toEqual(6)
		// todo: test actual sync actions are correct
	})
})
