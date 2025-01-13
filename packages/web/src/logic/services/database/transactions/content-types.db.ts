import {CreateContentTypeDto, ContentTypeDto, ContentTypeVersionDto, UpdateContentTypeDto} from "../../../schemas/content-types/dtos.ts";
import {DataChangeEvent, EventTypes} from "../../events/events.ts";
import {ErrorTypes, HeadbaseError, LiveQueryResult} from "../../../control-flow.ts";
import {Observable} from "rxjs";
import {GlobalListingOptions} from "../db.ts";
import {DeviceContext, IDatabaseService, IEventsService} from "../../interfaces.ts";
import {EntityTransactionsConfig} from "./fields.db.ts";
import {sqlBuilder} from "./drizzle/sql-builder.ts";
import {
	contentTypes,
	contentTypesVersions,
	DatabaseContentType,
	DatabaseContentTypeVersion
} from "./drizzle/tables/content-types.ts";
import {and, eq} from "drizzle-orm";
import {HEADBASE_VERSION} from "../../../headbase-web.ts";
import {ColourField} from "../../../schemas/common/fields.ts";


export class ContentTypeTransactions {
	private readonly context: DeviceContext;

	constructor(
		config: EntityTransactionsConfig,
		private readonly eventsService: IEventsService,
		private readonly databaseService: IDatabaseService
	) {
		this.context = config.context
	}

	static mapDatabaseEntityToDto(result: DatabaseContentType): ContentTypeDto {
		return {
			id: result.id,
			versionId: result.version_id,
			previousVersionId: result.previous_version_id,
			createdAt: result.created_at,
			createdBy: result.created_by,
			updatedAt: result.updated_at,
			updatedBy: result.updated_by,
			isDeleted: result.is_deleted === 1,
			hbv: result.hbv as "1.0",
			name: result.name,
			icon: result.icon,
			colour: result.colour as ColourField,
			description: result.description,
			templateName: result.template_name,
			templateFields: JSON.parse(result.template_fields as string),
		}
	}

	static mapDatabaseVersionToDto(result: DatabaseContentTypeVersion): ContentTypeVersionDto {
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
			hbv: result.hbv as "1.0",
			name: result.name,
			icon: result.icon,
			colour: result.colour as ColourField,
			description: result.description,
			templateName: result.template_name,
			templateFields: JSON.parse(result.template_fields as string),
		}
	}
	
	async create(databaseId: string, createDto: CreateContentTypeDto): Promise<ContentTypeDto> {
		console.debug(`[database] running create content type`)

		const entityId = createDto.id || self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		const createQuery = sqlBuilder
			.insert(contentTypes)
			.values({
				id: createDto.id || entityId,
				version_id: versionId,
				created_at: createdAt,
				created_by: createDto.createdBy,
				updated_at: createdAt,
				updated_by: createDto.createdBy,
				is_deleted: 0,
				hbv: HEADBASE_VERSION,
				name: createDto.name,
				icon: createDto.icon,
				colour: createDto.colour,
				description: createDto.description,
				template_name: createDto.templateName,
				template_fields: createDto.templateFields,
			})
			.toSQL()
		await this.databaseService.exec({databaseId, ...createQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'content_types',
				id: entityId,
				action: 'create'
			}
		})

		return this.get(databaseId, entityId)
	}

	async update(databaseId: string, entityId: string, updateDto: UpdateContentTypeDto): Promise<ContentTypeDto> {
		console.debug(`[database] running update content type`)

		const currentEntity = await this.get(databaseId, entityId)

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		const updateQuery = sqlBuilder
			.update(contentTypes)
			.set({
				version_id: versionId,
				previous_version_id: currentEntity.id,
				updated_at: updatedAt,
				updated_by: updateDto.createdBy,
				name: updateDto.name,
				icon: updateDto.icon,
				colour: updateDto.colour,
				description: updateDto.description,
				template_name: updateDto.templateName,
				template_fields: updateDto.templateFields,
			})
			.where(eq(contentTypes.id, entityId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...updateQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'content_types',
				id: entityId,
				action: 'update'
			}
		})

		// todo: do this via "return" sql instead?
		return this.get(databaseId, entityId)
	}

	async delete(databaseId: string, entityId: string): Promise<void> {
		console.debug(`[database] running delete content type: ${entityId}`)

		// Will cause error if entity can't be found.
		await this.get(databaseId, entityId)

		const deleteQuery = sqlBuilder
			.update(contentTypes)
			.set({
				is_deleted: 1,
			})
			.where(eq(contentTypes.id, entityId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...deleteQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'content_types',
				id: entityId,
				action: 'delete'
			}
		})
	}

	async get(databaseId: string, entityId: string): Promise<ContentTypeDto> {
		console.debug(`[database] running get content type: ${entityId}`)

		const selectQuery = sqlBuilder
			.select()
			.from(contentTypes)
			.where(and(eq(contentTypes.id, entityId), eq(contentTypes.is_deleted, 0)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseContentType[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND})
		}

		return ContentTypeTransactions.mapDatabaseEntityToDto(results[0])
	}

	async query(databaseId: string, options?: GlobalListingOptions): Promise<ContentTypeDto[]> {
		console.debug(`[database] running get content types`)

		const selectQuery = sqlBuilder
			.select()
			.from(contentTypes)
			.where(eq(contentTypes.is_deleted, 0))
			.orderBy(contentTypes.updated_at)
			.toSQL()
		console.debug(selectQuery)
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseContentType[];

		return results.map(ContentTypeTransactions.mapDatabaseEntityToDto)
	}

	liveGet(databaseId: string, entityId: string) {
		return new Observable<LiveQueryResult<ContentTypeDto>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.get(databaseId, entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.tableKey === 'content_types' &&
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
		return new Observable<LiveQueryResult<ContentTypeDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.query(databaseId, options);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.tableKey === 'content_types'
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
			.from(contentTypesVersions)
			.where(and(eq(contentTypesVersions.id, versionId), eq(contentTypesVersions.is_deleted, 0)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseContentTypeVersion[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND})
		}

		return ContentTypeTransactions.mapDatabaseVersionToDto(results[0])
	}

	async getVersions(databaseId: string, entityId: string) {
		console.debug(`[database] running getFieldVersions: ${entityId}`)

		const selectQuery = sqlBuilder
			.select()
			.from(contentTypesVersions)
			.where(and(eq(contentTypesVersions.entity_id, entityId), eq(contentTypesVersions.is_deleted, 0)))
			.orderBy(contentTypesVersions.updated_at)
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseContentTypeVersion[];

		return results.map(ContentTypeTransactions.mapDatabaseVersionToDto)
	}

	async deleteVersion(databaseId: string, versionId: string): Promise<void> {
		const version = await this.getVersion(databaseId, versionId);
		const currentEntity = await this.get(databaseId, version.entityId);

		if (currentEntity.versionId === versionId) {
			// todo: need error type, or generic user input error type?
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: 'Attempted to delete current version'})
		}

		const deleteQuery = sqlBuilder
			.update(contentTypesVersions)
			.set({
				is_deleted: 1,
			})
			.where(eq(contentTypesVersions.id, versionId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...deleteQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'content_types',
				id: currentEntity.id,
				// todo: should include version id in event?
				action: 'delete-version'
			}
		})
	}

	liveGetVersions(databaseId: string, entityId: string) {
		return new Observable<LiveQueryResult<ContentTypeVersionDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getVersions(databaseId, entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.tableKey === 'content_types' &&
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
