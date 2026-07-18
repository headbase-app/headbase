import {describe, expect, test} from "vitest";
import {jsonquery} from "@jsonquerylang/jsonquery";
import {jsonQueryMapAdd} from "./query-data-objects"

describe("Should be able to query ", () => {
	test("Custom mapAdd() jsonquery function should work for mapping objects", () => {
		const data = [
			{
				first: "Sam",
				last: "Vimes"
			},
			{
				first: "Tiffany",
				last: "Aching"
			}
		]

		const result = jsonquery(data, "mapAdd({name: .first + \" \" + .last})", {
			functions: {
				mapAdd: jsonQueryMapAdd
			}
		})

		expect(result).toEqual([
			{
				name: "Sam Vimes",
				first: "Sam",
				last: "Vimes"
			},
			{
				name: "Tiffany Aching",
				first: "Tiffany",
				last: "Aching"
			}
		])
	})
})
