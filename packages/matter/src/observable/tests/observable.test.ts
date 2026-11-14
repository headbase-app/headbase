import {beforeAll, beforeEach, describe, expect, test} from "vitest";
import {
    type IMatterDriver,
    LIVE_QUERY_LOADING_STATE,
    type LiveQueryResult, type MatterDocument,
    _MatterObservable, _MatterDatabase
} from "../../index.js";
import {createTestDocumentDto} from "../../../tests/create-test-doc.js";
import {TestDriver} from "../../../tests/test-driver.js";

describe("_MatterObservable", () => {
    let driver: IMatterDriver
    let db: _MatterDatabase
    let observable: _MatterObservable

    beforeAll(() => {
        driver = new TestDriver(":memory:")
        db = new _MatterDatabase(driver)
        observable = new _MatterObservable(db)
    })

    // Overwrite the driver state to teardown & setup fresh for each test
    beforeEach(async () => {
        driver.isReady = false;
        await driver.run('drop table if exists documents')
        await driver.run('drop table if exists documents_versions')
        await driver.init()
        driver.isReady = true;
    })

    test("query should observe ", async () => {
        const results: LiveQueryResult<MatterDocument[]>[] = []
        const liveDocs = observable.liveQuery()
        const subscription = liveDocs.subscribe((result) => {
            results.push(result)
        })

        await new Promise<void>(resolve => {setTimeout(() => {resolve()}, 0)})

        const doc1 = createTestDocumentDto()
        await db.create(doc1);
        const doc2 = createTestDocumentDto()
        await db.create(doc2);

        const doc1Update = {data: {updated: "this is an update"}}
        await db.update(doc1.id, doc1Update)

        // Hack to allow the final observable update to be reflected in results array, seems to work reliably enough.
        await new Promise<void>(resolve => {setTimeout(() => {resolve()}, 0)})

        expect(results).toEqual([
            LIVE_QUERY_LOADING_STATE,
            {status: "success", result: []},
            LIVE_QUERY_LOADING_STATE,
            {
                status: "success",
                result: [
                    expect.objectContaining({
                        ...doc1,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        deleted: null,
                    })
                ]
            },
            LIVE_QUERY_LOADING_STATE,
            {
                status: "success",
                result: [
                    expect.objectContaining({
                        ...doc1,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        deleted: null,
                    }),
                    expect.objectContaining({
                        ...doc2,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        deleted: null,
                    })
                ]
            },
            LIVE_QUERY_LOADING_STATE,
            {
                status: "success",
                result: [
                    expect.objectContaining({
                        ...doc1,
                        ...doc1Update,
                        vid: expect.any(String),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        deleted: null,
                    }),
                    expect.objectContaining({
                        ...doc2,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        deleted: null,
                    })
                ]
            },
        ])

        subscription.unsubscribe()
    })
})
