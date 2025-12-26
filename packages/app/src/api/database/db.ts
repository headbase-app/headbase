import 	{drizzle, SqliteRemoteDatabase} from 'drizzle-orm/sqlite-proxy';
import {DatabaseSchema, historyTable, objectsTable} from "./schema.ts";
import {asc, desc, eq, sql} from "drizzle-orm";
import type {CreateObjectDto, ObjectDto, ObjectVersionDto, Query, UpdateObjectDto} from "./types.ts";
import {ALLOWED_OBJECT_FIELDS, convertDataJsonPath, parseWhereQuery} from "./utils.ts";
import {Observable} from "rxjs";
import type {LiveQueryResult} from "@api/control-flow.ts";
import {EventTypes, type ObjectChangeEvent, type VersionChangeEvent} from "@api/events/events.ts";
import type {IEventsService} from "@api/events/events.interface.ts";
import {SQLocalDrizzle} from "sqlocal/drizzle";
import setupScript from "./migrations/00-setup.sql?raw"
import type {IDeviceService} from "@api/device/device.interface.ts";

export const SPEC_V1 = "https://spec.headbase.app/v1"

export interface DatabaseConfig {
	databasePath: string
}

export interface DatabaseConnection {
	db: SqliteRemoteDatabase<DatabaseSchema>
	transaction: SQLocalDrizzle['transaction']
}

// todo: blob data is currently supplied as ArrayBuffer but might be returned from SQLite/Drizzle as Uint8Array
export class HeadbaseDatabase {
	#config: DatabaseConfig
	#connection?: DatabaseConnection

	constructor(
		private readonly eventsService: IEventsService,
		private readonly deviceService: IDeviceService,
		config: DatabaseConfig
	) {
		this.#config = config
	}

	async getDatabase(): Promise<DatabaseConnection> {
		if (this.#connection) {
			return this.#connection;
		}

		const { driver, batchDriver, transaction } = new SQLocalDrizzle(this.#config.databasePath)
		const db = drizzle(driver, batchDriver, {casing: "snake_case", schema: DatabaseSchema});
		this.#connection = {db, transaction}
		await this.#connection.db.run(setupScript);
		return this.#connection;
	}

	async create(createObjectDto: CreateObjectDto): Promise<ObjectDto> {
		const {db, transaction} = await this.getDatabase()

		const id = createObjectDto.id || globalThis.crypto.randomUUID()
		const versionId = globalThis.crypto.randomUUID()
		const timestamp = new Date().toISOString()

		await transaction(async (tx) => {
			await tx.query(db.insert(objectsTable).values({
					spec: SPEC_V1,
					type: createObjectDto.type,
					id: id,
					versionId: versionId,
					previousVersionId: null,
					createdAt: timestamp,
					createdBy: createObjectDto.createdBy,
					updatedAt: timestamp,
					updatedBy: createObjectDto.createdBy,
					fields: createObjectDto.fields,
					blob: createObjectDto.blob,
				}
			))

			await tx.query(db.insert(historyTable).values({
				spec: SPEC_V1,
				type: createObjectDto.type,
				id: versionId,
				objectId: id,
				previousVersionId: null,
				createdAt: timestamp,
				createdBy: createObjectDto.createdBy,
				updatedAt: timestamp,
				updatedBy: createObjectDto.createdBy,
				deletedAt: null,
				deletedBy: null,
				fields: createObjectDto.fields,
				blob: createObjectDto.blob,
			}))
		})

		this.eventsService.dispatch(EventTypes.OBJECT_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				vaultId: "",
				action: "create",
				id,
				versionId,
				types: [createObjectDto.type],
			}
		})

		// todo: use return from transaction?
		return this.get(id)
	}

	async update(id: string, updateObjectDto: UpdateObjectDto): Promise<ObjectDto> {
		const currentObject = await this.get(id)
		const versionId = self.crypto.randomUUID()
		const timestamp = new Date().toISOString()

		const {db, transaction} = await this.getDatabase()

		await transaction(async (tx) => {
			await tx.query(db.update(objectsTable)
				.set({
					type: updateObjectDto.type,
					fields: updateObjectDto.fields,
					blob: updateObjectDto.blob,
					updatedAt: timestamp,
					updatedBy: updateObjectDto.updatedBy,
				})
				.where(eq(objectsTable.id, id))
			)

			await tx.query(db.insert(historyTable).values({
					spec: SPEC_V1,
					type: updateObjectDto.type || currentObject.type,
					objectId: id,
					id: versionId,
					previousVersionId: null,
					createdAt: currentObject.createdAt,
					createdBy: currentObject.createdBy,
					updatedAt: timestamp,
					updatedBy: updateObjectDto.updatedBy,
					deletedAt: null,
					deletedBy: null,
					fields: updateObjectDto.fields || currentObject.fields,
					// Ensure updating blob to null is kept in version, but use existing blob if present otherwise.
					blob: updateObjectDto.blob === null ? null : updateObjectDto.blob || currentObject.blob,
				})
			)
		})

		const types =  updateObjectDto.type ? [currentObject.type, updateObjectDto.type] : [currentObject.type]
		this.eventsService.dispatch(EventTypes.OBJECT_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				vaultId: "",
				action: "update",
				id,
				versionId,
				types,
			}
		})

		// todo: use return from transaction?
		return this.get(id)
	}

	async delete(id: string, deletedBy: string): Promise<void> {
		const currentObject = await this.get(id)
		const timestamp = new Date().toISOString()

		const {db, transaction} = await this.getDatabase()

		await transaction(async (tx) => {
			await tx.query(db.delete(objectsTable).where(eq(objectsTable.id, id)))

			await tx.query(db.update(historyTable)
				.set({deletedAt: timestamp, deletedBy})
				.where(eq(historyTable.objectId, id))
			)
		})

		this.eventsService.dispatch(EventTypes.OBJECT_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				vaultId: "",
				action: "delete",
				id,
				versionId: currentObject.versionId,
				types: [currentObject.type],
			}
		})
	}

	async get(id: string): Promise<ObjectDto> {
		const {db} = await this.getDatabase()
		const results = await db.select().from(objectsTable).where(eq(objectsTable.id, id));
		if (results[0]) {
			return results[0]
		}

		throw new Error(`Cannot find object with id ${id}`)
	}

	async query(query?: Query) {
		const {db} = await this.getDatabase()

		const orderBy = [];
		if (query?.order) {
			const orderByFields = Object.keys(query.order)
			if (orderByFields.length) {
				for (const field of orderByFields) {
					if (ALLOWED_OBJECT_FIELDS.includes(field)) {
						// using sql.raw is ok here because we are checking for an allowed set of values.
						orderBy.push(query.order[field] === 'desc' ? desc(sql.raw(field)) : asc(sql.raw(field)))
					}
					else if (field.startsWith("/data/")) {
						orderBy.push(sql.raw(convertDataJsonPath(field)))
					}
					else {
						throw new Error(`Attempted to use invalid field for ordering: ${field}`)
					}
				}
			}
		}

		return db.query.objectsTable.findMany({
			limit: query?.page?.limit,
			offset: query?.page?.offset,
			orderBy: orderBy,
			where: query?.where && parseWhereQuery(query.where)
		})
	}

	liveGet(id: string) {
		return new Observable<LiveQueryResult<ObjectDto>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.get(id);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: ObjectChangeEvent) => {
				if (e.detail.data.id === id) {
					console.debug(`[liveGet] Received event that requires re-query`)
					runQuery()
				}
			}

			this.eventsService.subscribe(EventTypes.OBJECT_CHANGE, handleEvent)
			runQuery()

			return () => {
				this.eventsService.unsubscribe(EventTypes.OBJECT_CHANGE, handleEvent)
			}
		})
	}

	liveQuery(query?: Query) {
		return new Observable<LiveQueryResult<ObjectDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.query(query);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = () => {
				console.debug(`[observableGet] Received event that requires re-query`)
				runQuery()
			}

			this.eventsService.subscribe(EventTypes.OBJECT_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.eventsService.unsubscribe(EventTypes.OBJECT_CHANGE, handleEvent)
			}
		})
	}

	async getHistory(versionId: string): Promise<ObjectVersionDto> {
		const {db} = await this.getDatabase()
		const results = await db.select().from(historyTable).where(eq(historyTable.id, versionId));
		if (results[0]) {
			return results[0]
		}

		throw new Error(`Cannot find history with id ${versionId}`)
	}

	async deleteHistory(versionId: string, deletedBy: string): Promise<void> {
		const currentVersion = await this.getHistory(versionId)
		const currentObject = await this.get(currentVersion.objectId)

		if (currentObject.versionId === versionId) {
			throw new Error('Cannot delete the current version')
		}

		const timestamp = new Date().toISOString()
		const {db, transaction} = await this.getDatabase()
		await transaction(async (tx) => {
			await tx.query(db.update(historyTable)
				.set({deletedAt: timestamp, deletedBy})
				.where(eq(historyTable.id, versionId))
			)
		})

		this.eventsService.dispatch(EventTypes.VERSION_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				vaultId: "",
				action: "delete",
				id: currentObject.versionId,
				objectId: currentVersion.objectId,
			}
		})
	}

	async queryHistory(objectId: string): Promise<ObjectVersionDto[]> {
		const {db} = await this.getDatabase()
		return db.query.historyTable.findMany({
			where: eq(historyTable.objectId, objectId),
			orderBy: desc(historyTable.updatedAt)
		})
	}

	liveQueryHistory(objectId: string) {
		return new Observable<LiveQueryResult<ObjectVersionDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.queryHistory(objectId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: ObjectChangeEvent | VersionChangeEvent) => {
				if (e.type === EventTypes.OBJECT_CHANGE && e.detail.data.id === objectId) {
					console.debug(`[liveQueryHistory] Received object event that requires re-query`)
					runQuery()
				}
				else if (e.type === EventTypes.VERSION_CHANGE && e.detail.data.objectId === objectId) {
					console.debug(`[liveQueryHistory] Received version event that requires re-query`)
					runQuery()
				}
			}

			this.eventsService.subscribe(EventTypes.VERSION_CHANGE, handleEvent)
			this.eventsService.subscribe(EventTypes.OBJECT_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.eventsService.unsubscribe(EventTypes.VERSION_CHANGE, handleEvent)
				this.eventsService.unsubscribe(EventTypes.OBJECT_CHANGE, handleEvent)
			}
		})
	}

	async destroy() {
		// todo: preform any cleanup actions
	}
}
