import {beforeAll, beforeEach, describe, expect, type Mock, test, vitest} from "vitest";
import {type IMatterDriver, _MatterDatabase, MatterDatabaseErrors} from "../../../index.js";
import {createTestDocumentDto} from "../../../../tests/create-test-doc.js";
import {webcrypto} from "node:crypto";
import {EventTypes} from "../../../events/events.js";
import {TestDriver} from "../../../../tests/test-driver.js";

describe("matter.deleteVersion", () => {
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

    test("when deleting old version, should update to set tombstone", async () => {
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

        const updatedVersion = await matter.getVersion(update1.vid)
        expect(updatedVersion).toEqual({
            ...createDocumentDto,
            ...update1,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: true,
        })

        expect(dispatchSpy).toHaveBeenNthCalledWith(4, EventTypes.VERSION_DELETE, {vid: update1.vid, id: createDocumentDto.id})

        const docAfterVersionDelete = await matter.get(createDocumentDto.id)
        expect(docAfterVersionDelete).toEqual({
            ...createDocumentDto,
            ...update2,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })
    })

    test("when deleting latest document version, should fail", async () => {
        const createDocumentDto = createTestDocumentDto()
        await matter.create(createDocumentDto)

        // Apply some updates to generate multiple versions for more realistic tests
        const update1 = {vid: webcrypto.randomUUID(), data: {name: "this is update 1"}}
        const {vid} = await matter.update(createDocumentDto.id, update1)
        const updatedDoc = await matter.get(createDocumentDto.id)

        expect(updatedDoc).toEqual({
            ...createDocumentDto,
            ...update1,
            vid,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })

        await expect(async () => {
            return matter.deleteVersion(update1.vid)
        }).rejects.toThrow(MatterDatabaseErrors.M_DENIED_LATEST_VERSION_DELETE)
    })
})
