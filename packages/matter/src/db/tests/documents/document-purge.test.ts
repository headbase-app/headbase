import {beforeAll, beforeEach, describe, expect, type Mock, test, vitest} from "vitest";
import {type IMatterDriver, _MatterDatabase, MatterDatabaseErrors} from "../../../index.js";
import {createTestDocumentDto} from "../../../../tests/create-test-doc.js";
import {EventTypes} from "../../../events/events.js";
import {webcrypto} from "node:crypto";
import {TestDriver} from "../../../../tests/test-driver.js";

describe("matter.purge", () => {
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

    test("given soft deleted document, should permanently delete document and all versions", async () => {
        const createDocumentDto = createTestDocumentDto()
        await matter.create(createDocumentDto);

        const update1 = {vid: webcrypto.randomUUID(), data: {name: "this is update 1"}}
        const update2 = {vid: webcrypto.randomUUID(), data: {name: "this is update 2"}}
        await matter.update(createDocumentDto.id, update1)
        await matter.update(createDocumentDto.id, update2)

        await matter.delete(createDocumentDto.id)
        await matter.purge(createDocumentDto.id)

        await expect(async () => {
            return matter.get(createDocumentDto.id)
        }).rejects.toThrow(MatterDatabaseErrors.M_NOT_FOUND)

        expect(dispatchSpy).toHaveBeenCalledWith(EventTypes.DOCUMENT_PURGE, { id: createDocumentDto.id })

        const results = await matter._UNSAFE_raw_queryVersions(`where id = '${createDocumentDto.id}'`)
        expect(results).toEqual([])
    })

    test("given document not soft deleted, should fail with M_DENIED_PURGE_BEFORE_DELETE", async () => {
        const createDocumentDto = createTestDocumentDto()
        await matter.create(createDocumentDto);

        const update1 = {vid: webcrypto.randomUUID(), data: {name: "this is update 1"}}
        const update2 = {vid: webcrypto.randomUUID(), data: {name: "this is update 2"}}
        await matter.update(createDocumentDto.id, update1)
        await matter.update(createDocumentDto.id, update2)

        await expect(async () => {
            return matter.purge(createDocumentDto.id)
        }).rejects.toThrow(MatterDatabaseErrors.M_DENIED_PURGE_BEFORE_DELETE)
    })
})
