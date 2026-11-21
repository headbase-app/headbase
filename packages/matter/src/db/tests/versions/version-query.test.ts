import {beforeAll, beforeEach, describe, expect, test} from "vitest";
import {webcrypto} from "node:crypto";
import {type IMatterDriver, Matter} from "../../../index.js";
import {createTestDocumentDto} from "../../../../tests/create-test-doc.js";
import {TestDriver} from "../../../../tests/test-driver.js";


describe("matter.queryVersions", () => {
    let driver: IMatterDriver
    let matter: Matter

    beforeAll(() => {
        driver = new TestDriver(":memory:")
        matter = new Matter(driver)
    })

    // Overwrite the driver state to teardown & setup fresh for each test
    beforeEach(async () => {
        driver.isReady = false;
        await driver.run('drop table if exists documents')
        await driver.run('drop table if exists documents_versions')
        await driver.init()
        driver.isReady = true;
    })

    test("_UNSAFE_raw_queryVersions should allow custom query", async () => {
        const docs = [createTestDocumentDto({type: "testing"}), createTestDocumentDto(), createTestDocumentDto(), createTestDocumentDto()];
        for (const doc of docs) {
            await matter.create(doc);
        }

        const results = await matter._UNSAFE_raw_queryVersions(`where id='${docs[0]?.id}'`)
        expect(results).toEqual([
            {
                ...docs[0],
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                deleted: null,
            }
        ])
    })

    test("should return versions by document id", async () => {
        const createDocumentDto = createTestDocumentDto();
        const createDocumentDto2 = createTestDocumentDto();
        await matter.create(createDocumentDto);
        await matter.create(createDocumentDto2);

        const update1 = {vid: webcrypto.randomUUID(), data: {name: "this is update 1"}};
        const update2 = {vid: webcrypto.randomUUID(), data: {name: "this is update 2"}};
        await matter.update(createDocumentDto.id, update1);
        await matter.update(createDocumentDto.id, update2);

        const doc1Versions = await matter._UNSAFE_raw_queryVersions(`where id='${createDocumentDto.id}'`)
        expect(doc1Versions).toEqual([
            {
                ...createDocumentDto,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                deleted: null,
            },
            {
                ...createDocumentDto,
                ...update1,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                deleted: null,
            },
            {
                ...createDocumentDto,
                ...update2,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                deleted: null,
            }
        ])

        const doc2Versions = await matter._UNSAFE_raw_queryVersions(`where id='${createDocumentDto2.id}'`)
        expect(doc2Versions).toEqual([
            {
                ...createDocumentDto2,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                deleted: null,
            }
        ])
    })
})
