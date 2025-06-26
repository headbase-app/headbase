import {
	ErrorTypes,
	HeadbaseError,
	LIVE_QUERY_LOADING_STATE,
	LiveQueryResult,
	LiveQueryStatus,
} from "../../control-flow.ts";
import {Observable} from "rxjs";
import {EventMap, EventTypes} from "../events/events.ts";
import {EncryptionService} from "../encryption/encryption.ts"
import {EventsService} from "../events/events.service.ts";
import {SQLocalDrizzle} from "sqlocal/drizzle";
import {drizzle, SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {DeviceContext} from "../../interfaces.ts";
import {schema, documents, documentsHistory} from "./schema.ts"
import {and, asc, desc, eq, isNull, sql} from "drizzle-orm";
import migration0 from "./migrations/00-setup.sql?raw"
import {featureFlags} from "../../../flags.ts";
import {HEADBASE_SPEC_VERSION} from "../../app.ts";
import {CreateLocalDocument, LocalDocument, LocalDocumentVersion, Query, UpdateLocalDocument} from "./types.ts";
import {ALLOWED_DOCUMENT_FIELDS, convertDataJsonPath, parseWhereQuery} from "./documents.utils.ts";

export interface DocumentsServiceConfig {
	context: DeviceContext
}

interface ConnectionStore {
	[key: string]: {
		db: SqliteRemoteDatabase<typeof schema>,
		destroy: () => Promise<void>
	}
}

export class DocumentsService {
	private readonly config: DocumentsServiceConfig
	readonly connectionStore: ConnectionStore

	constructor(
		config: DocumentsServiceConfig,
		private events: EventsService
	) {
		this.config = config
		this.connectionStore = {}
	}

	async destroy() {
		for (const connection of Object.values(this.connectionStore)) {
			await connection.destroy()
		}
	}

	private async getDatabase(vaultId: string): Promise<SqliteRemoteDatabase<typeof schema>> {
		if (this.connectionStore[vaultId]) {
			return this.connectionStore[vaultId].db;
		}

		const { driver, batchDriver, destroy } = new SQLocalDrizzle({
			databasePath: `/headbase/${vaultId}/database.sqlite3`,
			verbose: featureFlags().debug_sqlite
		});
		this.connectionStore[vaultId] = {
			db: drizzle(driver, batchDriver, {casing: "snake_case"}),
			destroy,
		}

		console.debug(migration0)
		await this.connectionStore[vaultId].db.run(migration0)

		return this.connectionStore[vaultId].db;
	}

	/**
	 * Get a single document.
	 *
	 * @param vaultId
	 * @param id
	 */
	async get(vaultId: string, id: string): Promise<LocalDocument> {
		const db = await this.getDatabase(vaultId)
		const result = await db
			.select()
			.from(documents)
			.where(eq(documents.id, id))

		if (!result[0]) {
			throw new HeadbaseError({type: ErrorTypes.NOT_FOUND, devMessage: `document ${id} not found`})
		}

		return result[0]
	}

	/**
	 * Create a new document.
	 *
	 * @param vaultId
	 * @param createDocumentDto
	 */
	async create(vaultId: string, createDocumentDto: CreateLocalDocument): Promise<string> {
		const db = await this.getDatabase(vaultId)

		const id = EncryptionService.generateUUID();
		const timestamp = new Date().toISOString();

		await db.insert(documents).values({
			spec: HEADBASE_SPEC_VERSION,
			type: createDocumentDto.type,
			id,
			versionId: id,
			previousVersionId: null,
			createdAt: timestamp,
			createdBy: createDocumentDto.createdBy,
			updatedAt: timestamp,
			updatedBy: createDocumentDto.createdBy,
			deletedAt: null,
			data: createDocumentDto.data,
		})
		await db.insert(documentsHistory).values({
			spec: HEADBASE_SPEC_VERSION,
			type: createDocumentDto.type,
			documentId: id,
			id,
			previousVersionId: null,
			createdAt: timestamp,
			createdBy: createDocumentDto.createdBy,
			deletedAt: null,
			data: createDocumentDto.data,
		})

		this.events.dispatch(EventTypes.DOCUMENTS_CHANGE, {
			context: this.config.context,
			data: {
				vaultId,
				types: [createDocumentDto.type],
				id: id,
				versionId: id,
				action: 'create'
			}
		})

		return id
	}

	/**
	 * Update the given document
	 *
	 * @param vaultId
	 * @param id
	 * @param updateDto
	 */
	async update(vaultId: string, id: string, updateDto: UpdateLocalDocument): Promise<LocalDocument> {
		const db = await this.getDatabase(vaultId)

		const currentDocument = await this.get(vaultId, id)
		const versionId = self.crypto.randomUUID()
		const timestamp = new Date().toISOString()

		await db.insert(documentsHistory).values({
			spec: HEADBASE_SPEC_VERSION,
			type: updateDto.type,
			documentId: id,
			id: versionId,
			previousVersionId: currentDocument.versionId,
			createdAt: timestamp,
			createdBy: currentDocument.createdBy,
			deletedAt: null,
			data: updateDto.data,
		})

		await db
			.update(documents)
			.set({
				type: updateDto.type,
				updatedAt: timestamp,
				updatedBy: updateDto.updatedBy,
				data: updateDto.data
			})
			.where(eq(documents.id, id))

		this.events.dispatch(EventTypes.DOCUMENTS_CHANGE, {
			context: this.config.context,
			data: {
				vaultId,
				types: [currentDocument.type, updateDto.type],
				id: id,
				versionId: versionId,
				action: 'update'
			}
		})

		// todo: do this via "return" sql instead?
		return this.get(vaultId, id)
	}

	/**
	 * Delete the given document.
	 */
	async delete(vaultId: string, id: string): Promise<void> {
		// Allows error to be thrown on none existing item, and type to be included in event.
		const currentDocument = await this.get(vaultId, id)

		const deletedAt = new Date().toISOString()

		const db = await this.getDatabase(vaultId)
		await db.delete(documents).where(eq(documents.id, id))
		await db
			.update(documentsHistory)
			.set({deletedAt})
			.where(eq(documentsHistory.documentId, id))

		this.events.dispatch(EventTypes.DOCUMENTS_CHANGE, {
			context: this.config.context,
			data: {
				vaultId,
				types: [currentDocument.type],
				id: id,
				versionId: id,
				action: 'delete'
			}
		})
	}

	/**
	 * Query for documents.
	 */
	async query(vaultId: string, query?: Query): Promise<LocalDocument[]> {
		const db = await this.getDatabase(vaultId)

		const orderBy = [];
		if (query?.order) {
			const orderByFields = Object.keys(query.order)
			if (orderByFields.length) {
				for (const field of orderByFields) {
					if (ALLOWED_DOCUMENT_FIELDS.includes(field)) {
						// using sql.raw is ok here because we are checking for an allowed set of values.
						orderBy.push(query.order[field] === 'desc' ? desc(sql.raw(field)) : asc(sql.raw(field)))
					}
					else if (field.startsWith("/data/")) {
						orderBy.push(sql.raw(convertDataJsonPath(field)))
					}
					else {
						throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: `Attempted to use invalid field for ordering: ${field}`})
					}
				}
			}
		}

		const where = query?.where && parseWhereQuery(query.where)

		// todo: return paging info if using limit/offset
		return await db.query.documents.findMany({
				limit: query?.page?.limit,
				offset: query?.page?.offset,
				orderBy: orderBy,
				where: where
			}) as LocalDocument[]
	}

	liveGet(vaultId: string, id: string) {
		return new Observable<LiveQueryResult<LocalDocument>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.get(vaultId, id);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: EventMap["documents-change"]) => {
				if (
					e.detail.data.vaultId === vaultId &&
					e.detail.data.id === id
				) {
					console.debug(`[documents] Live get received event that triggered query`)
					runQuery()
				}
			}

			this.events.subscribe(EventTypes.DOCUMENTS_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.events.unsubscribe(EventTypes.DOCUMENTS_CHANGE, handleEvent)
			}
		})
	}

	liveQuery(vaultId: string, query?: Query) {
		return new Observable<LiveQueryResult<LocalDocument[]>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				subscriber.next(LIVE_QUERY_LOADING_STATE)

				try {
					const results = await this.query(vaultId, query)
					subscriber.next({status: LiveQueryStatus.SUCCESS, result: results})
				}
				catch (e) {
					subscriber.next({status: LiveQueryStatus.ERROR, errors: [e]})
				}
			}

			const handleEvent = (e: EventMap["documents-change"]) => {
				if (e.detail.data.vaultId === vaultId) {
					runQuery()
				}
			}

			this.events.subscribe(EventTypes.DOCUMENTS_CHANGE, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.events.unsubscribe(EventTypes.DOCUMENTS_CHANGE, handleEvent)
			}
		})
	}

	async createVersion(vaultId: string, documentVersion: LocalDocumentVersion): Promise<void> {
		const db = await this.getDatabase(vaultId)

		await db.insert(documentsHistory).values(documentVersion)

		let currentDocument
		try {
			currentDocument = await this.get(vaultId, documentVersion.id)
		}
		catch(e) {
			// todo: handle different errors
		}

		// Create new document if one doesn't already exist.
		if (!currentDocument) {
			console.debug(`[documents] encountered new version '${documentVersion.id}' so creating document.`)
			await db.insert(documents).values({
				spec: HEADBASE_SPEC_VERSION,
				type: documentVersion.type,
				id: documentVersion.documentId,
				versionId: documentVersion.id,
				previousVersionId: documentVersion.previousVersionId,
				createdAt: documentVersion.createdAt,
				createdBy: documentVersion.createdBy,
				updatedAt: documentVersion.createdAt,
				updatedBy: documentVersion.createdBy,
				deletedAt: null,
				data: documentVersion.data,
			})
		}
		// Update existing document to match version if it's newer.
		else if (currentDocument.createdAt < documentVersion.createdAt) {
			await db
				.update(documents)
				.set({
					spec: documentVersion.spec,
					type: documentVersion.type,
					versionId: documentVersion.id,
					previousVersionId: documentVersion.previousVersionId,
					updatedAt: documentVersion.createdAt,
					updatedBy: documentVersion.createdBy,
					data: documentVersion.data,
				})
				.where(eq(documents.id, documentVersion.documentId))
		}

		this.events.dispatch(EventTypes.DOCUMENTS_CHANGE, {
			context: this.config.context,
			data: {
				vaultId,
				types: currentDocument ? [currentDocument.type, documentVersion.type] : [documentVersion.type],
				id: documentVersion.documentId,
				versionId: documentVersion.id,
				action: 'create-version'
			}
		})
	}

	async getVersion(vaultId: string, versionId: string) {
		const db = await this.getDatabase(vaultId)

		const results = await db
			.select()
			.from(documentsHistory)
			.where(and(eq(documentsHistory.id, versionId), isNull(documentsHistory.deletedAt)))

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.NOT_FOUND})
		}
		return results[0]
	}

	// todo: support real queries like documents?
	async queryVersions(vaultId: string, documentId: string) {
		const db = await this.getDatabase(vaultId)

		return db
			.select()
			.from(documentsHistory)
			.where(and(eq(documentsHistory.documentId, documentId), isNull(documentsHistory.deletedAt)))
	}

	async deleteVersion(vaultId: string, versionId: string): Promise<void> {
		const db = await this.getDatabase(vaultId)
		const version = await this.getVersion(vaultId, versionId);

		// The first version created will have a versionId which matches the documentId. In that situation, delete
		// the document too. This is how deletion of documents can sync between devices when only the history is synced.
		if (versionId === version.documentId) {
			return this.delete(vaultId, version.id)
		}

		const deletedAt = new Date().toISOString()
		await db
			.update(documentsHistory)
			.set({deletedAt})
			.where(eq(documentsHistory.id, versionId))
			.toSQL()

		this.events.dispatch(EventTypes.DOCUMENTS_CHANGE, {
			context: this.config.context,
			data: {
				vaultId,
				types: [version.type],
				id: version.id,
				versionId: version.id,
				action: 'delete-version'
			}
		})
	}

	liveQueryVersions(vaultId: string, documentId: string) {
		return new Observable<LiveQueryResult<LocalDocumentVersion[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.queryVersions(vaultId, documentId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: EventMap["documents-change"]) => {
				if (
					e.detail.data.vaultId === vaultId &&
					e.detail.data.id === documentId
				) {
					console.debug(`[observableGet] Received event that requires re-query`)
					runQuery()
				}
			}

			this.events.subscribe(EventTypes.DOCUMENTS_CHANGE, handleEvent)

			return () => {
				this.events.unsubscribe(EventTypes.DOCUMENTS_CHANGE, handleEvent)
			}
		})
	}
}
