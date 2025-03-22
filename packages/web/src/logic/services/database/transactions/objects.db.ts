import {DataChangeEvent, EventTypes} from "../../events/events.ts";
import {ErrorTypes, HeadbaseError, LiveQueryResult} from "../../../control-flow.ts";
import {Observable} from "rxjs";
import {GlobalListingOptions} from "../db.ts";
import {DeviceContext, IDatabaseService, IEventsService} from "../../interfaces.ts";
import {DrizzleDataObject, DrizzleDataVersion, objects, objectVersions} from "./drizzle/schema.ts";
import {sqlBuilder} from "./drizzle/sql-builder.ts";
import {and, eq} from "drizzle-orm";
import {HEADBASE_SPEC_VERSION} from "../../../headbase-web.ts";
import {CreateDataObjectDto, DataObject, DataObjectVersion, UpdateDataObjectDto} from "./types.ts";


export interface EntityTransactionsConfig {
	context: DeviceContext;
}


export class ObjectTransactions {
	private readonly context: DeviceContext;

	constructor(
		config: EntityTransactionsConfig,
		private readonly eventsService: IEventsService,
		private readonly databaseService: IDatabaseService
	) {
		this.context = config.context
	}

	static mapDatabaseEntityToDto(result: DrizzleDataObject): DataObject {
		return {
			spec: result.spec,
			type: result.type,
			id: result.id,
			versionId: result.version_id,
			previousVersionId: result.previous_version_id,
			createdAt: result.created_at,
			createdBy: result.created_by,
			updatedAt: result.updated_at,
			updatedBy: result.updated_by,
			data: JSON.parse(result.data as string),
		}
	}

	static mapDatabaseVersionToDto(result: DrizzleDataVersion): DataObjectVersion {
		return {
			spec: result.spec,
			type: result.type,
			objectId: result.object_id,
			id: result.id,
			previousVersionId: result.previous_version_id,
			createdAt: result.created_at,
			createdBy: result.created_by,
			data: JSON.parse(result.data as string),
		}
	}
	
	async create(databaseId: string, createDto: CreateDataObjectDto): Promise<DataObject> {
		console.debug(`[database] running create field`)

		const id = createDto.id || self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		const query = sqlBuilder
			.insert(objects)
			.values({
				spec: HEADBASE_SPEC_VERSION,
				type: createDto.type,
				id: id,
				version_id: versionId,
				previous_version_id: null,
				created_at: createdAt,
				created_by: createDto.createdBy,
				updated_at: createdAt,
				updated_by: createDto.createdBy,
				data: createDto.data
			})
			.toSQL()
		await this.databaseService.exec({databaseId, ...query})

		const versionQuery = sqlBuilder
			.insert(objectVersions)
			.values({
				spec: HEADBASE_SPEC_VERSION,
				type: createDto.type,
				object_id: id,
				id: versionId,
				previous_version_id: null,
				created_at: createdAt,
				created_by: createDto.createdBy,
				data: createDto.data,
				is_deleted: 0,
			})
			.toSQL()
		await this.databaseService.exec({databaseId, ...versionQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				types: [createDto.type],
				id: id,
				action: 'create'
			}
		})

		return this.get(databaseId, id)
	}

	async update(databaseId: string, id: string, updateDto: UpdateDataObjectDto): Promise<DataObject> {
		console.debug(`[database] running update field`)

		const currentObject = await this.get(databaseId, id)
		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		const query = sqlBuilder
			.update(objects)
			.set({
				type: updateDto.type,
				updated_at: updatedAt,
				updated_by: updateDto.updatedBy,
				data: updateDto.data
			})
			.where(eq(objects.id, id))
			.toSQL()
		await this.databaseService.exec({databaseId, ...query})

		const versionQuery = sqlBuilder
			.insert(objectVersions)
			.values({
				spec: HEADBASE_SPEC_VERSION,
				type: updateDto.type,
				object_id: id,
				id: versionId,
				previous_version_id: currentObject.versionId,
				created_at: updatedAt,
				created_by: updateDto.updatedBy,
				data: updateDto.data,
				is_deleted: 0,
			})
			.toSQL()
		await this.databaseService.exec({databaseId, ...versionQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				types: [currentObject.type, updateDto.type],
				id: id,
				action: 'update'
			}
		})

		// todo: do this via "return" sql instead?
		return this.get(databaseId, id)
	}

	async delete(databaseId: string, id: string): Promise<void> {
		console.debug(`[database] running delete field: ${id}`)

		// Will cause error if entity can't be found.
		const currentObject = await this.get(databaseId, id)

		const query = sqlBuilder
			.delete(objects)
			.where(eq(objects.id, id))
			.toSQL()
		await this.databaseService.exec({databaseId, ...query})

		const versionQuery = sqlBuilder
			.update(objectVersions)
			.set({is_deleted: 1})
			.where(eq(objectVersions.object_id, id))
			.toSQL()
		await this.databaseService.exec({databaseId, ...query})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				types: [currentObject.type],
				id: id,
				action: 'delete'
			}
		})
	}

	async get(databaseId: string, id: string): Promise<DataObject> {
		console.debug(`[database] running get field: ${id}`)

		const selectQuery = sqlBuilder
			.select()
			.from(objects)
			.where(and(eq(objects.id, id)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DrizzleDataObject[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND})
		}

		return ObjectTransactions.mapDatabaseEntityToDto(results[0])
	}

	async query(databaseId: string, options?: GlobalListingOptions): Promise<DataObject[]> {
		console.debug(`[database] running get objects`)

		const selectQuery = sqlBuilder
			.select()
			.from(objects)
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DrizzleDataObject[];

		return results.map(ObjectTransactions.mapDatabaseEntityToDto)
	}

	liveGet(databaseId: string, entityId: string) {
		return new Observable<LiveQueryResult<DataObject>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.get(databaseId, entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.id === entityId
				) {
					console.debug(`[observableGet] Received event that requires re-query`)
					runQuery()
				}
			}

			this.eventsService.subscribe(EventTypes.DATA_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.eventsService.unsubscribe(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	liveQuery(databaseId: string, options?: GlobalListingOptions) {
		return new Observable<LiveQueryResult<DataObject[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.query(databaseId, options);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId
				) {
					console.debug(`[observableGet] Received event that requires re-query`)
					runQuery()
				}
			}

			this.eventsService.subscribe(EventTypes.DATA_CHANGE, handleEvent)

			runQuery()

			return () => {
				this.eventsService.unsubscribe(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}

	async getVersion(databaseId: string, id: string) {
		console.debug(`[database] running get version: ${id}`)

		const selectQuery = sqlBuilder
			.select()
			.from(objectVersions)
			.where(and(eq(objectVersions.id, id), eq(objectVersions.is_deleted, 0)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DrizzleDataVersion[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND})
		}

		return ObjectTransactions.mapDatabaseVersionToDto(results[0])
	}

	async getVersions(databaseId: string, objectId: string) {
		console.debug(`[database] running get versions: ${objectId}`)

		const selectQuery = sqlBuilder
			.select()
			.from(objectVersions)
			.where(and(eq(objectVersions.object_id, objectId), eq(objectVersions.is_deleted, 0)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DrizzleDataVersion[];

		return results.map(ObjectTransactions.mapDatabaseVersionToDto)
	}

	async deleteVersion(databaseId: string, versionId: string): Promise<void> {
		const version = await this.getVersion(databaseId, versionId);
		const currentObject = await this.get(databaseId, version.objectId);

		if (currentObject.versionId === versionId) {
			// todo: need error type, or generic user input error type?
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: 'Attempted to delete initial version'})
		}

		const deleteQuery = sqlBuilder
			.update(objectVersions)
			.set({
				is_deleted: 1,
			})
			.where(eq(objectVersions.id, versionId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...deleteQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				types: [version.type, currentObject.type],
				id: currentObject.id,
				// todo: should include version id in event?
				action: 'delete-version'
			}
		})
	}

	liveGetVersions(databaseId: string, entityId: string) {
		return new Observable<LiveQueryResult<DataObjectVersion[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getVersions(databaseId, entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.id === entityId
				) {
					console.debug(`[observableGet] Received event that requires re-query`)
					runQuery()
				}
			}

			this.eventsService.subscribe(EventTypes.DATA_CHANGE, handleEvent)

			return () => {
				this.eventsService.unsubscribe(EventTypes.DATA_CHANGE, handleEvent)
			}
		})
	}
}
