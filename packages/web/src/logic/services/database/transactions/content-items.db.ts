import {
	ContentItemDto,
	ContentItemVersionDto,
	CreateContentItemDto,
	UpdateContentItemDto
} from "../../../schemas/content-items/dtos.ts";
import {DataChangeEvent, EventTypes} from "../../events/events.ts";
import {ErrorTypes, HeadbaseError, LiveQueryResult} from "../../../control-flow.ts";
import {Observable} from "rxjs";
import {GlobalListingOptions} from "../db.ts";
import {DeviceContext, IDatabaseService, IEventsService} from "../../interfaces.ts";
import {EntityTransactionsConfig} from "./fields.db.ts";
import {sqlBuilder} from "./drizzle/sql-builder.ts";
import {
	contentItems,
	contentItemsVersions,
	DatabaseContentItem,
	DatabaseContentItemVersion
} from "./drizzle/tables/content-items.ts";
import {and, eq} from "drizzle-orm";
import {HEADBASE_VERSION} from "../../../headbase-web.ts";


export class ContentItemTransactions {
	private readonly context: DeviceContext;

	constructor(
		config: EntityTransactionsConfig,
		private readonly eventsService: IEventsService,
		private readonly databaseService: IDatabaseService
	) {
		this.context = config.context
	}

	static mapDatabaseEntityToDto(result: DatabaseContentItem): ContentItemDto {
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
			type: result.type,
			isFavourite: result.is_favourite === 1,
			fields: JSON.parse(result.fields as string),
		}
	}

	static mapDatabaseVersionToDto(result: DatabaseContentItemVersion): ContentItemVersionDto {
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
			type: result.type,
			isFavourite: result.is_favourite === 1,
			fields: JSON.parse(result.fields as string),
		}
	}
	
	async create(databaseId: string, createDto: CreateContentItemDto): Promise<ContentItemDto> {
		console.debug(`[database] running create content item`)

		const entityId = createDto.id || self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		const createQuery = sqlBuilder
			.insert(contentItems)
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
				is_favourite: createDto.isFavourite ? 1 : 0,
				fields: createDto.fields,
			})
			.toSQL()
		await this.databaseService.exec({databaseId, ...createQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'content_items',
				id: entityId,
				action: 'create'
			}
		})

		return this.get(databaseId, entityId)
	}

	// todo: should allow partial updates?
	async update(databaseId: string, entityId: string, updateDto: UpdateContentItemDto): Promise<ContentItemDto> {
		console.debug(`[database] running update content item`)

		const currentEntity = await this.get(databaseId, entityId)

		if (currentEntity.type !== updateDto.type) {
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: "Attempted to change type of item"})
		}

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		const updateQuery = sqlBuilder
			.update(contentItems)
			.set({
				version_id: versionId,
				previous_version_id: currentEntity.versionId,
				updated_at: updatedAt,
				updated_by: updateDto.createdBy, // todo: should be updatedBy to be consistent
				name: updateDto.name,
				is_favourite: updateDto.isFavourite ? 1 : 0,
				fields: updateDto.fields,
			})
			.where(eq(contentItems.id, entityId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...updateQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'content_items',
				id: entityId,
				action: 'update'
			}
		})

		// todo: do this via "return" sql instead?
		return this.get(databaseId, entityId)
	}

	async delete(databaseId: string, entityId: string): Promise<void> {
		console.debug(`[database] running delete content item: ${entityId}`)

		// Will cause error if entity can't be found.
		await this.get(databaseId, entityId)

		const deleteQuery = sqlBuilder
			.update(contentItems)
			.set({
				is_deleted: 1,
			})
			.where(eq(contentItems.id, entityId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...deleteQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'content_items',
				id: entityId,
				action: 'delete'
			}
		})
	}

	async get(databaseId: string, entityId: string): Promise<ContentItemDto> {
		console.debug(`[database] running get content item: ${entityId}`)

		const selectQuery = sqlBuilder
			.select()
			.from(contentItems)
			.where(and(eq(contentItems.id, entityId), eq(contentItems.is_deleted, 0)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseContentItem[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND})
		}

		return ContentItemTransactions.mapDatabaseEntityToDto(results[0])
	}

	async query(databaseId: string, options?: GlobalListingOptions): Promise<ContentItemDto[]> {
		console.debug(`[database] running get content items`)

		const selectQuery = sqlBuilder
			.select()
			.from(contentItems)
			.where(eq(contentItems.is_deleted, 0))
			.orderBy(contentItems.updated_at)
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseContentItem[];

		return results.map(ContentItemTransactions.mapDatabaseEntityToDto)
	}

	liveGet(databaseId: string, entityId: string) {
		return new Observable<LiveQueryResult<ContentItemDto>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.get(databaseId, entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.tableKey === 'content_items' &&
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
		return new Observable<LiveQueryResult<ContentItemDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.query(databaseId, options);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.tableKey === 'content_items'
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
			.from(contentItemsVersions)
			.where(and(eq(contentItemsVersions.id, versionId), eq(contentItemsVersions.is_deleted, 0)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseContentItemVersion[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND})
		}

		return ContentItemTransactions.mapDatabaseVersionToDto(results[0])
	}

	async getVersions(databaseId: string, entityId: string) {
		console.debug(`[database] running getFieldVersions: ${entityId}`)

		const selectQuery = sqlBuilder
			.select()
			.from(contentItemsVersions)
			.where(and(eq(contentItemsVersions.entity_id, entityId), eq(contentItemsVersions.is_deleted, 0)))
			.orderBy(contentItemsVersions.updated_at)
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseContentItemVersion[];

		return results.map(ContentItemTransactions.mapDatabaseVersionToDto)
	}

	async deleteVersion(databaseId: string, versionId: string): Promise<void> {
		const version = await this.getVersion(databaseId, versionId);
		const currentEntity = await this.get(databaseId, version.entityId);

		if (currentEntity.versionId === versionId) {
			// todo: need error type, or generic user input error type?
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: 'Attempted to delete current version'})
		}

		const deleteQuery = sqlBuilder
			.update(contentItemsVersions)
			.set({
				is_deleted: 1,
			})
			.where(eq(contentItemsVersions.id, versionId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...deleteQuery})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'content_items',
				id: currentEntity.id,
				// todo: should include version id in event?
				action: 'delete-version'
			}
		})
	}

	liveGetVersions(databaseId: string, entityId: string) {
		return new Observable<LiveQueryResult<ContentItemVersionDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getVersions(databaseId, entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.tableKey === 'content_items' &&
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
