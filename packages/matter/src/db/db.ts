import type {CreateDocumentDto, MatterDocument, UpdateDocumentDto, VersionData} from "./types.js";
import {MatterDatabaseErrors} from "./types.js";
import type {IMatterDriver} from "../driver/driver.js";
import {parseQuery, type Query} from "../query/query.js";
import {EventsService} from "../events/events.service.js";
import {EventTypes} from "../events/events.js";

export interface MatterSQLiteDocument extends Omit<MatterDocument, 'data' | 'deleted'> {
    data: string
    deleted: 1 | 0 | null
}

export interface _MatterDatabaseConfig {
    /**
     * The number of days deleted documents and versions should be kept for.
     * This does not mean data is restorable, the retention period is solely to handle eventual consistency when syncing data.
     *
     * If not supplied a default of 90 days is used.
     */
    deletedRetentionDays?: number;
}

export class _MatterDatabase {
    events: EventsService;

    constructor(
        private driver: IMatterDriver,
        private config?: _MatterDatabaseConfig,
    ) {
        this.events = new EventsService();
    }

    private async ensureReady() {
        if (this.driver.isReady) return;
        await this.driver.init();
    }

    /**
     * Map a document/version database record to external type.
     * This includes parsing JSON and mapping the boolean 'deleted' field (as SQLite handles booleans via 0/1 integer)
     *
     * @param record
     * @private
     */
    private mapFromDatabaseRecord(record: MatterSQLiteDocument): MatterDocument {
        let data = null;
        if (record.data) {
            try {
                data = JSON.parse(record.data);
            }
            catch (error) {
                console.warn(`Encountered record '${record.id}' with none JSON data field`)
            }
        }

        return {
            ...record,
            data,
            deleted: typeof record.deleted === 'number'
                ? record.deleted === 1
                : null
        } as MatterDocument
    }

    async create(createDocumentDto: CreateDocumentDto): Promise<MatterDocument> {
        await this.ensureReady();

        const results = await this.driver.query<MatterSQLiteDocument[]>(
            'insert into documents (id, vid, type, data, blob) VALUES (?, ?, ?, ?, ?) returning *',
            [
                createDocumentDto.id,
                createDocumentDto.vid,
                createDocumentDto.type,
                JSON.stringify(createDocumentDto.data),
                createDocumentDto.blob
            ],
        )
        if (results[0]) {
            const doc = this.mapFromDatabaseRecord(results[0])
            this.events.dispatch(EventTypes.DOCUMENT_CREATE, {id: createDocumentDto.id, vid: createDocumentDto.vid});
            return doc
        }
        throw new Error(MatterDatabaseErrors.M_SYSTEM_ERROR, {cause: "Expected document via 'returning *' after insert but none was returned"})
    }

    async update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<VersionData> {
        await this.ensureReady();

        const vid = updateDocumentDto.vid ?? this.driver.randomUUID()
        const update = {
            ...updateDocumentDto,
            vid,
            deleted: typeof updateDocumentDto.deleted === "boolean"
                ? updateDocumentDto.deleted ? 1 : 0
                : null,
            data: updateDocumentDto.data ? JSON.stringify(updateDocumentDto.data) : null,
        }
        const cols = Object.keys(update).map(col => `${col}=?`);
        const values = Object.values(update)

        await this.driver.query<MatterSQLiteDocument[]>(
            `update documents set ${cols.join(",")} where id = ?`,
            [...values, id]
        )

        this.events.dispatch(EventTypes.DOCUMENT_UPDATE, {id, vid});
        return {vid}
    }

    async delete(id: string): Promise<VersionData> {
        await this.ensureReady();

        const vid = this.driver.randomUUID();
        await this.driver.query<MatterSQLiteDocument[]>('update documents set vid=?,deleted=true,data=null,blob=null where id = ?', [vid, id]);

        this.events.dispatch(EventTypes.DOCUMENT_DELETE, {id, vid});
        return {vid}
    }

    async purge(id: string): Promise<void> {
        await this.ensureReady();
        // Fetch before deletion to check record exists.
        // This isn't ideal but allows the driver to stay generic, otherwise there would need to be a way for the driver to return rows changed.
        const doc = await this.get(id);
        await this.driver.query<string[]>('delete from documents where id = ?', [id]);

        this.events.dispatch(EventTypes.DOCUMENT_PURGE, {id});
    }

    async get(id: string): Promise<MatterDocument> {
        await this.ensureReady();

        const results = await this.driver.query<MatterSQLiteDocument[]>('select * from documents where id = ?', [id])
        if (results[0]) return this.mapFromDatabaseRecord(results[0])
        throw new Error(MatterDatabaseErrors.M_NOT_FOUND, {cause: `Could not find document with id '${id}'`})
    }

    async query(query?: Query): Promise<MatterDocument[]> {
        await this.ensureReady();

        const sqlQuery = parseQuery({
            from: 'documents',
            ...query
        });

        const results = await this.driver.query<MatterSQLiteDocument[]>(sqlQuery.sql, sqlQuery.params);
        return results.map(this.mapFromDatabaseRecord)
    }

    /**
     * THIS IS AN UNSAFE METHOD THAT ALLOWS PASSING RAW SQL.
     *
     * Query for documents using a custom SQL query, implemented as "select * from documents {UNSAFE_query}".
     * This method does not filter out deleted documents, you must add this to your query.
     *
     * @param UNSAFE_query
     */
    async _UNSAFE_raw_query(UNSAFE_query: string): Promise<MatterDocument[]> {
        await this.ensureReady();

        const query = `select * from documents ${UNSAFE_query}`;
        const results = await this.driver.query<MatterSQLiteDocument[]>(query);
        return results.map(this.mapFromDatabaseRecord)
    }

    async createVersion(version: MatterDocument): Promise<MatterDocument> {
        await this.ensureReady();

        const results = await this.driver.query<MatterSQLiteDocument[]>(
            'insert into documents_versions (id, vid, type, data, blob, createdAt, updatedAt, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?) returning *',
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
        if (results[0]) {
            const version = this.mapFromDatabaseRecord(results[0])
            this.events.dispatch(EventTypes.VERSION_CREATE, {id: version.id, vid: version.vid});
            return version
        }
        throw new Error(MatterDatabaseErrors.M_SYSTEM_ERROR, {cause: "Expected version via 'returning *' after insert but none was returned"})
    }

    async deleteVersion(vid: string): Promise<void> {
        await this.ensureReady();

        const results = await this.driver.query<MatterSQLiteDocument[]>('update documents_versions set deleted=true where vid = ? returning *', [vid]);
        if (results[0]) {
            this.events.dispatch(EventTypes.VERSION_DELETE, {id: results[0].id, vid: results[0].vid});
            return;
        }

        throw new Error(MatterDatabaseErrors.M_NOT_FOUND, {cause: `Attempted to delete version with vid '${vid}' but was not found`})
    }

    async purgeVersion(vid: string): Promise<void> {
        await this.ensureReady();
        // Fetch before deletion to check record exists.
        // This isn't ideal but allows the driver to stay generic, otherwise there would need to be a way for the driver to return rows changed.
        const version = await this.getVersion(vid);
        await this.driver.query('delete from documents_versions where vid = ?', [vid]);

        this.events.dispatch(EventTypes.VERSION_PURGE, {id: version.id, vid: version.vid});
    }

    async getVersion(vid: string): Promise<MatterDocument> {
        await this.ensureReady();

        const results = await this.driver.query<MatterSQLiteDocument[]>('select * from documents_versions where vid = ?', [vid])
        if (results[0]) return this.mapFromDatabaseRecord(results[0])
        throw new Error(MatterDatabaseErrors.M_NOT_FOUND, {cause: `Could not find version with vid '${vid}'`})
    }

    async queryVersions(query?: Query): Promise<MatterDocument[]> {
        await this.ensureReady();

        const sqlQuery = parseQuery({
            from: 'documents_versions',
            ...query
        });

        const results = await this.driver.query<MatterSQLiteDocument[]>(sqlQuery.sql, sqlQuery.params);
        return results.map(this.mapFromDatabaseRecord)
    }

    /**
     * THIS IS AN UNSAFE METHOD THAT ALLOWS PASSING RAW SQL.
     *
     * Query for versions using a custom SQL query, implemented as "select * from documents_versions {UNSAFE_query}".
     * This method does not filter out deleted versions, you must add this to your query.
     *
     * @param UNSAFE_query
     */
    async _UNSAFE_raw_queryVersions(UNSAFE_query: string): Promise<MatterDocument[]> {
        await this.ensureReady();

        const query = `select * from documents_versions ${UNSAFE_query}`;
        const results = await this.driver.query<MatterSQLiteDocument[]>(query);
        return results.map(this.mapFromDatabaseRecord)
    }

    /**
     * Clean old deleted data beyond the configured retention period.
     * Throws error if no retention period is configured.
     *
     * todo: use custom injectable logger class not console?
     */
    async clean(): Promise<void> {
        await this.ensureReady();

        if (!this.config?.deletedRetentionDays) {
            throw new Error("Attempted to run clean but 'deletedRetentionDays' config has not been configured.")
        }
        const now = new Date();
        const _cutoff = new Date()
        _cutoff.setDate(now.getDate() - this.config?.deletedRetentionDays)
        const cutoff = _cutoff.toISOString()

        const oldDocuments = await this.driver.query<MatterSQLiteDocument[]>(`select * from documents where deleted=? and updatedAt < ?`, [1, cutoff])
        console.log(`[db] clean - Found ${oldDocuments.length} old documents to purge`, oldDocuments);
        for (const doc of oldDocuments) {
            await this.purge(doc.id);
            console.log(`[db] clean - Purged document ${doc.id}`);
        }

        const oldVersions = await this.driver.query<MatterSQLiteDocument[]>(`select * from documents_versions where deleted=? and updatedAt < ?`, [1, cutoff])
        console.log(`[db] clean - Found ${oldDocuments.length} old versions to purge`, oldDocuments);
        for (const version of oldVersions) {
            await this.purgeVersion(version.vid);
            console.log(`[db] clean - Purged version ${version.vid}`);
        }
    }
}