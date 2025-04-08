import {DataChangeEvent, EventTypes} from "../../events/events.ts";
import {ErrorTypes, HeadbaseError, LiveQueryResult} from "../../../control-flow.ts";
import {Observable} from "rxjs";
import {DeviceContext, IDatabaseService, IEventsService} from "../../interfaces.ts";
import {DrizzleDataObject, DrizzleDataVersion, objects, objectVersions} from "./drizzle/schema.ts";
import {sqlBuilder} from "./drizzle/sql-builder.ts";
import {
	and,
	asc,
	desc,
	eq,
	SQL,
	sql,
	inArray,
	or,
	ne,
	notInArray,
	like,
	notLike,
	ilike,
	notIlike, lt, lte, gt, gte, isNull
} from "drizzle-orm";
import {HEADBASE_SPEC_VERSION} from "../../../headbase-web.ts";
import {CreateDataObjectDto, DataObject, DataObjectVersion, Query, UpdateDataObjectDto, WhereQuery} from "./types.ts";


export interface EntityTransactionsConfig {
	context: DeviceContext;
}

const ALLOWED_OBJECT_FIELDS = ["spec", "type", "created_at", "created_by", "updated_at", "updated_by"]
const ALLOWED_VERSION_FIELDS = ["spec", "type", "created_at", "created_by"]

/**
 * Convert a JSON Path (/data/path/to/property) to the equivalent SQLite JSON Path (data->>$.path.to.property)
 */
function convertDataJsonPath(jsonPath: string): string {
	const pathSegments = jsonPath.split("/").slice(2)
	return `data->>'$${pathSegments.map(seg => `.${seg}`)}'`
}

/**
 * Parse a WhereQuery object and return a Drizzle SQL fragment for use in a Drizzle query.
 * @param query
 * @param column
 */
function parseWhereQuery(query: WhereQuery, column?: string): SQL | undefined {
	const conditions: (SQL|undefined)[] = []
	for (const [key, value] of Object.entries(query)) {
		if (column) {
			if (key === "$equal") {
				conditions.push(eq(sql.raw(column), value));
			}
			else if (key === "$notEqual") {
				conditions.push(ne(sql.raw(column), value));
			}
			else if (key === "$in") {
				conditions.push(inArray(sql.raw(column), value as (string|number)[]));
			}
			else if (key === "$notIn") {
				conditions.push(notInArray(sql.raw(column), value as (string|number)[]));
			}
			else if (key === "$like") {
				const likeValue = (value as string).startsWith("%") || (value as string).endsWith("%") ? value as string : `%${value}%`
				conditions.push(like(sql.raw(column), likeValue));
			}
			else if (key === "$notLike") {
				const likeValue = (value as string).startsWith("%") || (value as string).endsWith("%") ? value as string : `%${value}%`
				conditions.push(notLike(sql.raw(column), likeValue));
			}
			else if (key === "$iLike") {
				const likeValue = (value as string).startsWith("%") || (value as string).endsWith("%") ? value as string : `%${value}%`
				conditions.push(ilike(sql.raw(column), likeValue));
			}
			else if (key === "$notILike") {
				const likeValue = (value as string).startsWith("%") || (value as string).endsWith("%") ? value as string : `%${value}%`
				conditions.push(notIlike(sql.raw(column), likeValue));
			}
			else if (key === "$less") {
				conditions.push(lt(sql.raw(column), value));
			}
			else if (key === "$lessEqual") {
				conditions.push(lte(sql.raw(column), value));
			}
			else if (key === "$greater") {
				conditions.push(gt(sql.raw(column), value));
			}
			else if (key === "$greaterEqual") {
				conditions.push(gte(sql.raw(column), value));
			}
		}
		// todo: add other condition types (starts, ends, ranges)
		else if (key === "$or" && Array.isArray(value)) {
			conditions.push(or(...value.map(where => parseWhereQuery(where, column))));
		}
		else if (key === "$and" && Array.isArray(value)) {
			conditions.push(and(...value.map(where => parseWhereQuery(where, column))));
		}
		else if (ALLOWED_OBJECT_FIELDS.includes(key)) {
			conditions.push(parseWhereQuery(value as WhereQuery, key));
		}
		else if (key.startsWith("/data/")) {
			const sqlKey = convertDataJsonPath(key)
			console.debug(sqlKey)
			conditions.push(parseWhereQuery(value as WhereQuery, sqlKey));
		}
		else {
			throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: `Invalid condition '${key}/${value}/${column}' encountered in where query`})
		}
	}

	return and(...conditions)
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
			})
			.toSQL()
		await this.databaseService.exec({databaseId, ...versionQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				types: [createDto.type],
				id: id,
				versionId: versionId,
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
			})
			.toSQL()
		await this.databaseService.exec({databaseId, ...versionQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				types: [currentObject.type, updateDto.type],
				id: id,
				versionId: versionId,
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
		const deletedAt = new Date().toISOString()

		const query = sqlBuilder
			.delete(objects)
			.where(eq(objects.id, id))
			.toSQL()
		await this.databaseService.exec({databaseId, ...query})

		const versionQuery = sqlBuilder
			.update(objectVersions)
			.set({deleted_at: deletedAt})
			.where(eq(objectVersions.object_id, id))
			.toSQL()
		await this.databaseService.exec({databaseId, ...versionQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				types: [currentObject.type],
				id: id,
				versionId: id,
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

	async query(databaseId: string, query?: Query): Promise<DataObject[]> {
		console.debug(`[database] running query objects`)

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
						throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: `Attempted to use invalid field for ordering: ${field}`})
					}
				}
			}
		}

		const selectQuery = sqlBuilder
			.query.objects.findMany({
				limit: query?.page?.limit,
				offset: query?.page?.offset,
				orderBy: orderBy,
				where: query?.where && parseWhereQuery(query.where)
			})
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

	liveQuery(databaseId: string, query?: Query) {
		return new Observable<LiveQueryResult<DataObject[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.query(databaseId, query);
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

	async createVersion(databaseId: string, version: DataObjectVersion): Promise<void> {
		console.debug(`[database] running create version`)

		const versionQuery = sqlBuilder
			.insert(objectVersions)
			.values({
				spec: version.spec,
				type: version.type,
				object_id: version.objectId,
				id: version.id,
				previous_version_id: version.previousVersionId,
				created_at: version.createdAt,
				created_by: version.createdBy,
				data: version.data,
			})
			.toSQL()
		await this.databaseService.exec({databaseId, ...versionQuery})

		let currentObject
		try {
			currentObject = await this.get(databaseId, version.objectId)
		}
		catch(e) {
			// todo: handle different errors
		}

		if (!currentObject) {
			console.debug(`encountered new version '${version.id}' without object, creating now`)

			const query = sqlBuilder
				.insert(objects)
				.values({
					spec: version.spec,
					type: version.type,
					id: version.objectId,
					version_id: version.id,
					previous_version_id: version.previousVersionId,
					created_at: version.createdAt,
					created_by: version.createdBy,
					updated_at: version.createdAt,
					updated_by: version.createdBy,
					data: version.data
				})
				.toSQL()
			await this.databaseService.exec({databaseId, ...query})
		}
		else if (currentObject.createdAt < version.createdAt) {
			const query = sqlBuilder
				.update(objects)
				.set({
					spec: version.spec,
					type: version.type,
					version_id: version.id,
					previous_version_id: version.previousVersionId,
					updated_at: version.createdAt,
					updated_by: version.createdBy,
					data: version.data
				})
				.where(eq(objects.id, version.objectId))
				.toSQL()
			await this.databaseService.exec({databaseId, ...query})
		}

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				types: currentObject ? [currentObject.type, version.type] : [version.type],
				id: version.objectId,
				versionId: version.id,
				action: 'create-version'
			}
		})
	}

	async getVersion(databaseId: string, id: string) {
		console.debug(`[database] running get version: ${id}`)

		const selectQuery = sqlBuilder
			.select()
			.from(objectVersions)
			.where(and(eq(objectVersions.id, id), isNull(objectVersions.deleted_at)))
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
			.where(and(eq(objectVersions.object_id, objectId), isNull(objectVersions.deleted_at)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DrizzleDataVersion[];

		return results.map(ObjectTransactions.mapDatabaseVersionToDto)
	}

	async deleteVersion(databaseId: string, versionId: string): Promise<void> {
		const version = await this.getVersion(databaseId, versionId);

		if (versionId === version.objectId) {
			return this.delete(databaseId, version.objectId)
		}

		const deletedAt = new Date().toISOString()
		const deleteQuery = sqlBuilder
			.update(objectVersions)
			.set({
				deleted_at: deletedAt,
			})
			.where(eq(objectVersions.id, versionId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...deleteQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				types: [version.type],
				id: version.objectId,
				versionId: version.id,
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
