import {webcrypto} from "node:crypto";
import type {CreateDocumentDto, MatterDocument} from "../src/db/types.js";
import {IMatterDriver, type MatterSQLiteDocument} from "../src/index.js";

export function createTestDocumentDto(createDocumentDto?: Partial<CreateDocumentDto>) {
    return {
        id: webcrypto.randomUUID(),
        vid: webcrypto.randomUUID(),
        type: createDocumentDto?.type ?? "example",
        data: createDocumentDto?.data ?? {
            name: "this is an example",
            tags: ["example"],
            body: "#this is a example"
        },
        blob: createDocumentDto?.blob ?? null,
    }
}

export async function createTestDocument(driver: IMatterDriver, testDoc?: Partial<MatterDocument>): Promise<MatterDocument> {
    if (!driver.isReady) {
        await driver.init()
    }

    const doc = {
        id: testDoc?.id ?? webcrypto.randomUUID(),
        vid: testDoc?.vid ?? webcrypto.randomUUID(),
        type: testDoc?.type ?? "example",
        data: testDoc?.data ?? {
            name: "this is an example",
            tags: ["example"],
            body: "#this is a example"
        },
        blob: testDoc?.blob ?? null,
        createdAt: testDoc?.createdAt ?? new Date().toISOString(),
        updatedAt: testDoc?.updatedAt ?? new Date().toISOString(),
        deleted: typeof testDoc?.deleted === "boolean" ? testDoc.deleted : null,
    }

    await driver.query<MatterSQLiteDocument[]>(
        'insert into documents (id, vid, type, data, blob, createdAt, updatedAt, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
            doc.id,
            doc.vid,
            doc.type,
            JSON.stringify(doc.data),
            doc.blob,
            doc.createdAt,
            doc.updatedAt,
            typeof doc.deleted === "boolean"
                ? doc.deleted ? 1 : 0
                : null,
        ],
    )

    return doc
}

export async function createTestVersion(driver: IMatterDriver, testVersion?: Partial<MatterDocument>): Promise<MatterDocument> {
    if (!driver.isReady) {
        await driver.init()
    }

    const version = {
        id: testVersion?.id ?? webcrypto.randomUUID(),
        vid: testVersion?.vid ?? webcrypto.randomUUID(),
        type: testVersion?.type ?? "example",
        data: testVersion?.data ?? {
            name: "this is an example",
            tags: ["example"],
            body: "#this is a example"
        },
        blob: testVersion?.blob ?? null,
        createdAt: testVersion?.createdAt ?? new Date().toISOString(),
        updatedAt: testVersion?.updatedAt ?? new Date().toISOString(),
        deleted: typeof testVersion?.deleted === "boolean" ? testVersion.deleted : null,
    }

    await driver.query<MatterSQLiteDocument[]>(
        'insert into documents_versions (id, vid, type, data, blob, createdAt, updatedAt, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
            version.id,
            version.vid,
            version.type,
            JSON.stringify(version.data),
            version.blob,
            version.createdAt,
            version.updatedAt,
            typeof version.deleted === "boolean"
                ? version.deleted ? 1 : 0
                : null,
        ],
    )

    return version
}
