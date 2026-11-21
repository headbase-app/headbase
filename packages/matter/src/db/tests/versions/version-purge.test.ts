import {beforeAll, beforeEach, describe, expect, type Mock, test, vitest} from "vitest";
import {type IMatterDriver, Matter, MatterDatabaseErrors} from "../../../index.js";
import {createTestDocumentDto} from "../../../../tests/create-test-doc.js";
import {webcrypto} from "node:crypto";
import {EventTypes} from "../../../events/events.js";
import {TestDriver} from "../../../../tests/test-driver.js";

describe("matter.purgeVersion", () => {
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

    test("given version not soft deleted, should fail with M_DENIED_PURGE_BEFORE_DELETE", async () => {
        const createDocumentDto = createTestDocumentDto()
        await matter.create(createDocumentDto)

        // Apply some updates to generate multiple versions for more realistic tests
        const update1 = {vid: webcrypto.randomUUID(), data: {name: "this is update 1"}}
        const update2 = {vid: webcrypto.randomUUID(), data: {name: "this is update 2"}}
        await matter.update(createDocumentDto.id, update1)
        await matter.update(createDocumentDto.id, update2)

        const doc = await matter.get(createDocumentDto.id)
        expect(doc).toEqual({
            ...createDocumentDto,
            ...update2,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })

        await expect(async () => {
            return matter.purgeVersion(update1.vid)
        }).rejects.toThrow(MatterDatabaseErrors.M_DENIED_PURGE_BEFORE_DELETE)
    })

    test("given soft-deleted version, when purging old version, should permanently delete version", async () => {
        const createDocumentDto = createTestDocumentDto()
        await matter.create(createDocumentDto)

        // Apply some updates to generate multiple versions for more realistic tests
        const update1 = {vid: webcrypto.randomUUID(), data: {name: "this is update 1"}}
        const update2 = {vid: webcrypto.randomUUID(), data: {name: "this is update 2"}}
        await matter.update(createDocumentDto.id, update1)
        await matter.update(createDocumentDto.id, update2)

        const doc = await matter.get(createDocumentDto.id)
        expect(doc).toEqual({
            ...createDocumentDto,
            ...update2,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })

        await matter.deleteVersion(update1.vid)
        await matter.purgeVersion(update1.vid)

        await expect(async () => {
            return matter.getVersion(update1.vid)
        }).rejects.toThrow(MatterDatabaseErrors.M_NOT_FOUND)

        expect(dispatchSpy).toHaveBeenCalledWith(EventTypes.VERSION_PURGE, {vid: update1.vid, id: createDocumentDto.id})

        const docAfterVersionDelete = await matter.get(createDocumentDto.id)
        expect(docAfterVersionDelete).toEqual({
            ...createDocumentDto,
            ...update2,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })
    })

    test("given soft-deleted version, when purging latest document version, should fail with M_DENIED_LATEST_VERSION_DELETE", async () => {
        const createDocumentDto = createTestDocumentDto()
        await matter.create(createDocumentDto)

        // Apply some updates to generate multiple versions for more realistic tests
        const update1 = {vid: webcrypto.randomUUID(), data: {name: "this is update 1"}}
        const {vid} = await matter.update(createDocumentDto.id, update1);
        const updatedDoc = await matter.get(createDocumentDto.id)
        expect(updatedDoc).toEqual({
            ...createDocumentDto,
            ...update1,
            vid,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })

        // Delete document to generate new soft-deleted version
        const updatedDocument = await matter.delete(createDocumentDto.id)
        await expect(async () => {
            return matter.purgeVersion(updatedDocument.vid)
        }).rejects.toThrow(MatterDatabaseErrors.M_DENIED_LATEST_VERSION_DELETE)
    })
})
