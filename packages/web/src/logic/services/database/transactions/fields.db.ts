import {CreateFieldDto, FieldDto, FieldVersionDto, UpdateFieldDto} from "../../../schemas/fields/dtos.ts";
import {DataChangeEvent, EventTypes} from "../../events/events.ts";
import {ErrorTypes, HeadbaseError, LiveQueryResult} from "../../../control-flow.ts";
import {Observable} from "rxjs";
import {GlobalListingOptions} from "../db.ts";
import {DeviceContext, IDatabaseService, IEventsService} from "../../interfaces.ts";
import {DatabaseField, DatabaseFieldVersion, fields, fieldsVersions} from "./drizzle/tables/fields.ts";
import {sqlBuilder} from "./drizzle/sql-builder.ts";
import {and, eq} from "drizzle-orm";
import {HEADBASE_VERSION} from "../../../headbase-web.ts";


export interface EntityTransactionsConfig {
	context: DeviceContext;
}


export class FieldTransactions {
	private readonly context: DeviceContext;

	constructor(
		config: EntityTransactionsConfig,
		private readonly eventsService: IEventsService,
		private readonly databaseService: IDatabaseService
	) {
		this.context = config.context
	}

	static mapDatabaseEntityToDto(result: DatabaseField): FieldDto {
		return {
			id: result.id,
			versionId: result.version_id,
			previousVersionId: result.previous_version_id,
			createdAt: result.created_at,
			createdBy: result.created_by,
			updatedAt: result.updated_at,
			updatedBy: result.updated_by,
			isDeleted: result.is_deleted === 1,
			hbv: result.hbv,
			type: result.type,
			name: result.name,
			icon: result.icon,
			description: result.description,
			settings: JSON.parse(result.settings as string),
		}
	}

	static mapDatabaseVersionToDto(result: DatabaseFieldVersion): FieldVersionDto {
		return {
			...result,
			id: result.id,
			entityId: result.entity_id,
			previousVersionId: result.previous_version_id,
			createdAt: result.created_at,
			createdBy: result.created_by,
			updatedAt: result.updated_at,
			updatedBy: result.updated_by,
			isDeleted: result.is_deleted === 1,
			hbv: result.hbv,
			type: result.type,
			name: result.name,
			icon: result.icon,
			description: result.description,
			settings: JSON.parse(result.settings as string),
		}
	}
	
	async create(databaseId: string, createDto: CreateFieldDto): Promise<FieldDto> {
		console.debug(`[database] running create field`)

		const entityId = createDto.id || self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		const createQuery = sqlBuilder
			.insert(fields)
			.values({
				id: createDto.id || entityId,
				version_id: versionId,
				created_at: createdAt,
				created_by: createDto.createdBy,
				updated_at: createdAt,
				updated_by: createDto.createdBy,
				is_deleted: 0,
				hbv: HEADBASE_VERSION,
				type: createDto.type,
				name: createDto.name,
				icon: createDto.icon,
				description: createDto.description,
				settings: createDto.settings,
			})
			.toSQL()
		await this.databaseService.exec({databaseId, ...createQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'fields',
				id: entityId,
				action: 'create'
			}
		})

		return this.get(databaseId, entityId)
	}

	async update(databaseId: string, entityId: string, updateDto: UpdateFieldDto): Promise<FieldDto> {
		console.debug(`[database] running update field`)

		const currentEntity = await this.get(databaseId, entityId)

		if (currentEntity.type !== updateDto.type) {
			throw new Error('Attempted to change type of field')
		}

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		const updateQuery = sqlBuilder
			.update(fields)
			.set({
				version_id: versionId,
				previous_version_id: currentEntity.previousVersionId,
				updated_at: updatedAt,
				updated_by: updateDto.createdBy,
				type: updateDto.type,
				name: updateDto.name,
				icon: updateDto.icon,
				description: updateDto.description,
				settings: updateDto.settings,
			})
			.where(eq(fields.id, entityId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...updateQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'fields',
				id: entityId,
				action: 'update'
			}
		})

		// todo: do this via "return" sql instead?
		return this.get(databaseId, entityId)
	}

	async delete(databaseId: string, entityId: string): Promise<void> {
		console.debug(`[database] running delete field: ${entityId}`)

		// Will cause error if entity can't be found.
		await this.get(databaseId, entityId)

		const deleteQuery = sqlBuilder
			.update(fields)
			.set({
				is_deleted: 1,
			})
			.where(eq(fields.id, entityId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...deleteQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'fields',
				id: entityId,
				action: 'delete'
			}
		})
	}

	async get(databaseId: string, entityId: string): Promise<FieldDto> {
		console.debug(`[database] running get field: ${entityId}`)

		const selectQuery = sqlBuilder
			.select()
			.from(fields)
			.where(and(eq(fields.id, entityId), eq(fields.is_deleted, 0)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseField[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND})
		}

		return FieldTransactions.mapDatabaseEntityToDto(results[0])
	}

	async query(databaseId: string, options?: GlobalListingOptions): Promise<FieldDto[]> {
		console.debug(`[database] running get fields`)

		const selectQuery = sqlBuilder
			.select()
			.from(fields)
			.where(eq(fields.is_deleted, 0))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseField[];

		return results.map(FieldTransactions.mapDatabaseEntityToDto)
	}

	liveGet(databaseId: string, entityId: string) {
		return new Observable<LiveQueryResult<FieldDto>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.get(databaseId, entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.tableKey === 'fields' &&
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
		return new Observable<LiveQueryResult<FieldDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.query(databaseId, options);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.tableKey === 'fields'
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

	async getVersion(databaseId: string, versionId: string) {
		console.debug(`[database] running getFieldVersion: ${versionId}`)

		const selectQuery = sqlBuilder
			.select()
			.from(fieldsVersions)
			.where(and(eq(fieldsVersions.id, versionId), eq(fieldsVersions.is_deleted, 0)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseFieldVersion[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND})
		}

		return FieldTransactions.mapDatabaseVersionToDto(results[0])
	}

	async getVersions(databaseId: string, entityId: string) {
		console.debug(`[database] running getFieldVersions: ${entityId}`)

		const selectQuery = sqlBuilder
			.select()
			.from(fieldsVersions)
			.where(and(eq(fieldsVersions.entity_id, entityId), eq(fieldsVersions.is_deleted, 0)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseFieldVersion[];

		return results.map(FieldTransactions.mapDatabaseVersionToDto)
	}

	async deleteVersion(databaseId: string, versionId: string): Promise<void> {
		const version = await this.getVersion(databaseId, versionId);
		const currentEntity = await this.get(databaseId, version.entityId);

		if (currentEntity.versionId === versionId) {
			// todo: need error type, or generic user input error type?
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: 'Attempted to delete current version'})
		}

		const deleteQuery = sqlBuilder
			.update(fieldsVersions)
			.set({
				is_deleted: 1,
			})
			.where(eq(fieldsVersions.id, versionId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...deleteQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'fields',
				id: currentEntity.id,
				// todo: should include version id in event?
				action: 'delete-version'
			}
		})
	}

	liveGetVersions(databaseId: string, entityId: string) {
		return new Observable<LiveQueryResult<FieldVersionDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getVersions(databaseId, entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.tableKey === 'fields' &&
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
