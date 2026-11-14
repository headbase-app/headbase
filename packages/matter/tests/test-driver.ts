import {readFile} from "node:fs/promises";
import path from "path";
import type {IMatterDriver} from "../src/index.js";
import Sqlite3Database, {type Database} from "better-sqlite3";
import {webcrypto} from "node:crypto";

export const migration0 = await readFile(path.join(__dirname, "../migrations/00-setup.sql"), {encoding: "utf8"})

export class TestDriver implements IMatterDriver {
    db: Database;
    isReady: boolean;

    constructor(file: string) {
        this.db = new Sqlite3Database(file);
        this.isReady = false;
    }

    async init() {
        this.db.pragma('journal_mode = WAL');
        this.db.exec(migration0)
        this.isReady = true;
    }

    randomUUID(): string {
        return webcrypto.randomUUID();
    }

    async run(sql: string) {
        this.db.exec(sql)
    }

    async query<T>(sql: string, params?: any[]): Promise<T> {
        const prepared = this.db.prepare(sql)

        // Pick the correct method based on if the statement returns data
        // https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#properties-1
        if (prepared.reader) {
            return prepared.all(params ?? []) as T
        }

        return prepared.run(params ?? []) as T
    }
}