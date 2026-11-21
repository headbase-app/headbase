import {beforeAll, beforeEach, describe, expect, type Mock, test, vitest} from "vitest";
import {type IMatterDriver, Matter} from "../../../index.js";
import {createTestDocumentDto} from "../../../../tests/create-test-doc.js";
import {EventTypes} from "../../../events/events.js";
import {TestDriver} from "../../../../tests/test-driver.js";

describe("matter.create", () => {
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

    test("should create document and version", async () => {
        const createDocumentDto = createTestDocumentDto()
        const doc = await matter.create(createDocumentDto);

        expect(doc).toEqual({
            ...createDocumentDto,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })

        const version = await matter.getVersion(createDocumentDto.vid)
        expect(version).toEqual({
            ...createDocumentDto,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })

        expect(dispatchSpy).toHaveBeenCalledWith(EventTypes.DOCUMENT_CREATE, {id: createDocumentDto.id, vid: createDocumentDto.vid})
    })
})
