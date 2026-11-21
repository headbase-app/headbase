import {beforeAll, beforeEach, describe, expect, type Mock, test, vitest} from "vitest";
import {type IMatterDriver, Matter, type MatterDocument} from "../../../index.js";
import {createTestDocumentDto} from "../../../../tests/create-test-doc.js";
import {EventTypes} from "../../../events/events.js";
import {webcrypto} from "node:crypto";
import {TestDriver} from "../../../../tests/test-driver.js";

describe("matter.createVersion", () => {
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

    test("given no existing document, should create version and document", async () => {
        const version: MatterDocument = {
            ...createTestDocumentDto(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deleted: null,
        }

        const createdVersion = await matter.createVersion(version)
        expect(version).toEqual(createdVersion)

        expect(dispatchSpy).toHaveBeenCalledWith(EventTypes.VERSION_CREATE, {vid: version.vid, id: version.id})

        const doc = await matter.get(version.id)
        expect(doc).toEqual(version)
    })

    test("given existing document, when creating old version, should create version and not update document", async () => {
        const createDocumentDto = createTestDocumentDto({
            data: { title: "this is the initial doc" },
        })
        await matter.create(createDocumentDto)

        const now = new Date()
        const past = new Date(now.getTime() - 1000)
        const oldVersion: MatterDocument = {
            ...createDocumentDto,
            vid: webcrypto.randomUUID(),
            data: {title: "this is old version"},
            createdAt: past.toISOString(),
            updatedAt: past.toISOString(),
            deleted: null,
        }
        const createdVersion = await matter.createVersion(oldVersion)
        expect(createdVersion).toEqual(oldVersion)

        // Doc should still match initial version as inserted version was older.
        const doc = await matter.get(createDocumentDto.id)
        expect(doc).toEqual({
            ...createDocumentDto,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })
    })

    test("given existing document, when creating new version, should create version and update document", async () => {
        const createDocumentDto = createTestDocumentDto({
            data: { title: "this is the initial doc" },
        })
        const initialDoc = await matter.create(createDocumentDto)
        expect(initialDoc).toEqual({
            ...createDocumentDto,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })

        const now = new Date()
        const future = new Date(now.getTime() + 1000)
        const newVersion: MatterDocument = {
            ...createDocumentDto,
            vid: webcrypto.randomUUID(),
            data: {title: "this is new version"},
            createdAt: future.toISOString(),
            updatedAt: future.toISOString(),
            deleted: null,
        }
        const createdVersion = await matter.createVersion(newVersion)
        expect(createdVersion).toEqual(newVersion)

        // Doc should now match new inserted version
        const newDoc = await matter.get(createDocumentDto.id)
        expect(newDoc).toEqual(newVersion)
    })

    test("given existing document, when creating new deleted version, should create version and update document", async () => {
        const createDocumentDto = createTestDocumentDto({
            data: { title: "this is the initial doc" }
        })

        const initialDoc = await matter.create(createDocumentDto)
        expect(initialDoc).toEqual({
            ...createDocumentDto,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deleted: null,
        })

        const now = new Date()
        const future = new Date(now.getTime() + 1000)
        const newVersion: MatterDocument = {
            ...createDocumentDto,
            vid: webcrypto.randomUUID(),
            data: {title: "this is new deleted version"},
            createdAt: future.toISOString(),
            updatedAt: future.toISOString(),
            deleted: true,
        }
        const createdVersion = await matter.createVersion(newVersion)
        expect(createdVersion).toEqual(newVersion)

        // Doc should now match new inserted version
        const newDoc = await matter.get(createDocumentDto.id)
        expect(newDoc).toEqual(newVersion)
    })
})
