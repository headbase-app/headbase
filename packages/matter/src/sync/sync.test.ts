import {beforeAll, beforeEach, describe, expect, test} from "vitest";
import type {IMatterDriver} from "../driver/driver.js";
import {createTestDocumentDto} from "../../tests/create-test-doc.js";
import {_MatterSync, type SyncSnapshot} from "./sync.js";
import {Matter} from "../db/db.js";
import {TestDriver} from "../../tests/test-driver.js";

describe("_MatterSync", () => {
    let driver: IMatterDriver
    let db: Matter
    let sync: _MatterSync

    beforeAll(() => {
        driver = new TestDriver(":memory:")
        db = new Matter(driver)
        sync = new _MatterSync(db, {relayUrl: "", relaySecret: ""})
    })

    // Overwrite the driver state to teardown & setup fresh for each test
    beforeEach(async () => {
        driver.isReady = false;
        await driver.run('drop table if exists documents')
        await driver.run('drop table if exists documents_versions')
        await driver.init()
        driver.isReady = true;
    })

    test("sync", async () => {
        const doc = createTestDocumentDto()
        await db.create(doc)

        const update1 = {data: {update: "hello world"}}
        const {vid: update1Vid} = await db.update(doc.id, update1)

        const update2 = {data: {update: "hello world delete"}}
        const {vid: update2Vid} = await db.update(doc.id, update2)

        await db.deleteVersion(update1Vid)

        const snapshot = await sync._getLocalSnapshot();
        expect(snapshot).toEqual({
            config: {
                tombstoneExpiryDays: 90,
            },
            versions: {
                [doc.vid]: expect.any(String),
                [update2Vid]: expect.any(String),
            },
            deleted: [update1Vid]
        } satisfies SyncSnapshot)
    })
})
