import {beforeAll, beforeEach, describe, expect, type Mock, test, vitest} from "vitest";
import {type IMatterDriver, _MatterDatabase} from "../../../index.js";
import {createTestDocumentDto} from "../../../../tests/create-test-doc.js";
import {TestDriver} from "../../../../tests/test-driver.js";

describe("matter.query", () => {
    let driver: IMatterDriver
    let matter: _MatterDatabase
    let dispatchSpy: Mock

    beforeAll(() => {
        driver = new TestDriver(":memory:")
        matter = new _MatterDatabase(driver)
        dispatchSpy = vitest.spyOn(matter.events, 'dispatch')
    })

    // Overwrite the driver state to teardown & setup fresh for each test
    beforeEach(async () => {
        driver.isReady = false;
        await driver.run('drop table if exists documents')
        await driver.run('drop table if exists documents_versions')
        await driver.init()
        driver.isReady = true;
    })

    test("_UNSAFE_raw_query should allow custom query", async () => {
        const docs = [createTestDocumentDto({type: "testing"}), createTestDocumentDto(), createTestDocumentDto(), createTestDocumentDto()];
        for (const doc of docs) {
            await matter.create(doc);
        }

        const results = await matter._UNSAFE_raw_query(`where type='testing'`)
        expect(results).toEqual([
            {
                ...docs[0],
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                deleted: null,
            }
        ])
    })

    test("should return all documents", async () => {
        const docs = [createTestDocumentDto(), createTestDocumentDto(), createTestDocumentDto()];
        for (const doc of docs) {
            await matter.create(doc);
        }

        const results = await matter.query()
        expect(results).toEqual(docs.map((doc) => ({
            ...doc,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })))
    })
})
