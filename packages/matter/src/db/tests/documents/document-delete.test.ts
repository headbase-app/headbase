import {beforeAll, beforeEach, describe, expect, type Mock, test, vitest} from "vitest";
import {type IMatterDriver, Matter} from "../../../index.js";
import {createTestDocumentDto} from "../../../../tests/create-test-doc.js";
import {EventTypes} from "../../../events/events.js";
import {TestDriver} from "../../../../tests/test-driver.js";

describe("matter.delete", () => {
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

    test("should update document to set tombstone and create version", async () => {
        const createDocumentDto = createTestDocumentDto()
        await matter.create(createDocumentDto);

        const {vid} = await matter.delete(createDocumentDto.id);

        const updatedDoc = await matter.get(createDocumentDto.id);
        expect(updatedDoc).toEqual({
            ...createDocumentDto,
            vid: vid,
            data: null,
            blob: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: true
        })

        expect(dispatchSpy).toHaveBeenCalledWith(EventTypes.DOCUMENT_DELETE, {id: createDocumentDto.id, vid})

        const newVersion = await matter.getVersion(vid);
        expect(newVersion).toEqual({
            ...createDocumentDto,
            vid: vid,
            data: null,
            blob: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: true,
        })
    })
})
