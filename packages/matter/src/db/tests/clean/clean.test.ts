import {afterEach, beforeAll, beforeEach, describe, expect, type Mock, test, vi} from "vitest";
import {type IMatterDriver, _MatterDatabase} from "../../../index.js";
import {createTestDocument} from "../../../../tests/create-test-doc.js";
import {TestDriver} from "../../../../tests/test-driver.js";

describe("matter.clean", () => {
    let driver: IMatterDriver
    let matter: _MatterDatabase

    const DELETED_RETENTION_DAYS = 90
    const TEST_DATE = "2026-11-12T00:00:00.000Z"
    const DATE_WITHIN_RETENTION_PERIOD = "2026-10-12T00:00:00.000Z"
    const DATE_BEYOND_RETENTION_PERIOD = "2026-02-12T00:00:00.000Z"

    beforeAll(() => {
        driver = new TestDriver(":memory:")
        matter = new _MatterDatabase(driver, {deletedRetentionDays: DELETED_RETENTION_DAYS})
    })

    // Overwrite the driver state to teardown & setup fresh for each test
    beforeEach(async () => {
        driver.isReady = false;
        await driver.run('drop table if exists documents')
        await driver.run('drop table if exists documents_versions')
        await driver.init()
        driver.isReady = true;

        vi.useFakeTimers()
        vi.setSystemTime(TEST_DATE)
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    test("should remove deleted data beyond retention period", async () => {
        const doc1 = await createTestDocument(driver);
        const doc2 = await createTestDocument(driver);
        const doc3 = await createTestDocument(driver, {deleted: true, updatedAt: DATE_BEYOND_RETENTION_PERIOD});
        const doc4 = await createTestDocument(driver, {deleted: true, updatedAt: DATE_BEYOND_RETENTION_PERIOD});

        const before = await matter.query()
        expect(before).toEqual([doc1, doc2, doc3, doc4]);

        await matter.clean();

        const after = await matter.query()
        expect(after).toEqual([doc1, doc2]);
    })

    test("should NOT remove deleted data within retention period", async () => {
        const doc1 = await createTestDocument(driver);
        const doc2 = await createTestDocument(driver);
        const doc3 = await createTestDocument(driver, {deleted: true, updatedAt: DATE_BEYOND_RETENTION_PERIOD});
        const doc4 = await createTestDocument(driver, {deleted: true, updatedAt: DATE_WITHIN_RETENTION_PERIOD});

        const before = await matter.query()
        expect(before).toEqual([doc1, doc2, doc3, doc4]);

        await matter.clean();

        const after = await matter.query()
        expect(after).toEqual([doc1, doc2, doc4]);
    })
})
