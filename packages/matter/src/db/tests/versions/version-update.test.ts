import {beforeAll, beforeEach, describe, expect, type Mock, test, vitest} from "vitest";
import {type IMatterDriver, Matter, MatterDatabaseErrors} from "../../../index.js";
import {createTestDocumentDto} from "../../../../tests/create-test-doc.js";
import {webcrypto} from "node:crypto";
import {TestDriver} from "../../../../tests/test-driver.js";

describe("db - updateVersion", () => {
    let driver: IMatterDriver
    let matter: Matter
    let dispatchSpy: Mock

    beforeAll(() => {
        driver = new TestDriver(":memory:")
        matter = new Matter(driver)
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

    test("given old version, should fail as versions are immutable", async () => {
        const createDocumentDto = createTestDocumentDto()
        await matter.create(createDocumentDto)

        const update1 = {vid: webcrypto.randomUUID(), data: {name: "this is update 1"}}
        await matter.update(createDocumentDto.id, update1)

        await expect(async () => {
            return driver.query("update documents_versions set type='example2' where vid = ? returning *", [createDocumentDto.vid])
        }).rejects.toThrow(MatterDatabaseErrors.M_DENIED_VERSIONS_IMMUTABLE)
    })

    // todo: this isn't ideal behaviour, but may be a limitation based on trigger case order.
    // possibly separate triggers could be used and updates which are not the tombstone are handled first?
    test("given latest version, should fail but because latest version", async () => {
        const createDocumentDto = createTestDocumentDto()
        await matter.create(createDocumentDto)

        await expect(async () => {
            return driver.query("update documents_versions set type='example2' where vid = ? returning *", [createDocumentDto.vid])
        }).rejects.toThrow(MatterDatabaseErrors.M_DENIED_LATEST_VERSION_DELETE)
    })
})
