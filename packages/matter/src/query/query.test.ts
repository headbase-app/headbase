import {describe, expect, test} from "vitest";
import {parseQuery} from "./query.js";

describe("parseQuery", () => {
    describe.todo("and/or combinations", () => {
        test("top level should default to and combination", async () => {
            const result = parseQuery({
                from: "documents",
                where: {
                    type: {
                        $equal: "task",
                    },
                    created_at: {
                        $includes: "test1"
                    },
                },
                order: {
                    created_at: "desc"
                },
                page: {
                    limit: 10,
                    offset: 20,
                }
            })

            expect(result).toEqual({
                sql: "select * from documents where type = ? and json_extract(data, '$.body') like ? and json_extract(data, '$.priority') <= ? order by created_at desc limit ? offset ?",
                params: ['task', '%test1%', 2, 10, 20]
            })
        })

        test("top level $and should work", async () => {

        })

        test("top level $or should work", async () => {

        })

        test("nested combination of $and and $or should work", async () => {

        })
    })

    describe("combined queries", () => {
        test.todo("combined where/order/page should work", () => {
            const result = parseQuery({
                from: "documents",
                where: {
                    type: {
                        $equal: "task"
                    },
                    "json_extract(data, '$.body')": {
                        $includes: "test1"
                    },
                    "json_extract(data, '$.priority')": {
                        $lessEqual: 2,
                    }
                },
                order: {
                    created_at: "desc"
                },
                page: {
                    limit: 10,
                    offset: 20,
                }
            })

            expect(result).toEqual({
                sql: "select * from documents where type = ? and json_extract(data, '$.body') like ? and json_extract(data, '$.priority') <= ? order by created_at desc limit ? offset ?",
                params: ['task', '%test1%', 2, 10, 20]
            })
        })
    })
})