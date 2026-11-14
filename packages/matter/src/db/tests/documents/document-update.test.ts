import {beforeAll, beforeEach, describe, expect, type Mock, test, vitest} from "vitest";
import {type IMatterDriver, _MatterDatabase} from "../../../index.js";
import {createTestDocumentDto} from "../../../../tests/create-test-doc.js";
import {webcrypto} from "node:crypto";
import {EventTypes} from "../../../events/events.js";
import {TestDriver} from "../../../../tests/test-driver.js";

describe("matter.update", () => {
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

    test("should update document and create version", async () => {
        const createDocumentDto = createTestDocumentDto()
        const initialDoc = await matter.create(createDocumentDto);
        expect(initialDoc).toEqual({
            ...createDocumentDto,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })

        const update = {
            vid: webcrypto.randomUUID(),
            data: {body: "this is an example update"}
        }
        const {vid} = await matter.update(createDocumentDto.id, update)
        const updatedDoc = await matter.get(createDocumentDto.id)
        expect(updatedDoc).toEqual({
            ...createDocumentDto,
            ...update,
            vid,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })

        expect(dispatchSpy).toHaveBeenCalledWith(EventTypes.DOCUMENT_UPDATE, {id: initialDoc.id, vid })

        const newVersion = await matter.getVersion(update.vid)
        expect(newVersion).toEqual({
            ...createDocumentDto,
            ...update,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })
    })
})
