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
import {HEADBASE_VERSION} from "../../../headbase-web.ts";
import {EntityTransactionsConfig} from "./fields.db.ts";


export class ContentItemTransactions {
	private readonly context: DeviceContext;

	constructor(
		config: EntityTransactionsConfig,
		private readonly eventsService: IEventsService,
		private readonly databaseService: IDatabaseService
	) {
		this.context = config.context
	}
	
	async create(databaseId: string, createDto: CreateContentItemDto): Promise<ContentItemDto> {
		console.debug(`[database] running create content item`)

		const entityId = createDto.id || self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.databaseService.exec({
			databaseId,
			sql: `insert into content_items(id, created_at, is_deleted, hbv, current_version_id) values (?, ?, ?, ?, ?)`,
			params: [entityId, createdAt, 0, HEADBASE_VERSION, versionId]
		})

		await this.databaseService.exec({
			databaseId,
			sql: `
				insert into content_items_versions(
					id, created_at, is_deleted, hbv, entity_id, previous_version_id, created_by,
				 	type, name, is_favourite, fields
				) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			params: [
				versionId, createdAt, 0, HEADBASE_VERSION, entityId, null, createDto.createdBy,
				createDto.type, createDto.name, createDto.isFavourite, JSON.stringify(createDto.fields)
			]
		})

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

	async update(databaseId: string, entityId: string, updateDto: UpdateContentItemDto): Promise<ContentItemDto> {
		console.debug(`[database] running update content item`)

		const currentEntity = await this.get(databaseId, entityId)

		if (currentEntity.type !== updateDto.type) {
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: "Attempted to change type of item"})
		}

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		await this.databaseService.exec({
			databaseId,
			sql: `update content_items set current_version_id = ? where id = ?`,
			params: [versionId, entityId]
		})

		await this.databaseService.exec({
			databaseId,
			sql: `
          insert into content_items_versions(
              id, created_at, is_deleted, hbv, entity_id, previous_version_id, created_by,
              type, name, is_favourite, fields
          ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			params: [
				versionId, updatedAt, 0, HEADBASE_VERSION, entityId, currentEntity.versionId, updateDto.createdBy,
				updateDto.type, updateDto.name, updateDto.isFavourite, JSON.stringify(updateDto.fields)
			]
		})

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

		await this.databaseService.exec({
			databaseId,
			sql: `update content_items set is_deleted = 1 where id = ?`,
			params: [entityId]
		})

		await this.databaseService.exec({
			databaseId,
			sql: `delete from content_items_versions where entity_id = ?`,
			params: [entityId]
		})

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

		const results = await this.databaseService.exec({
			databaseId,
			sql: `
				select
					e.id as id,
					e.created_at as createdAt,
					v.created_at as updatedAt,
					e.is_deleted as isDeleted,
					v.id as versionId,
					v.previous_version_id as previousVersionId,
					v.created_by as createdBy,
          v.type as type,
					v.name as name,
          v.is_favourite as isFavourite,
					v.fields as fields
				from content_items e
				inner join content_items_versions v on e.id = v.entity_id
				where e.id = ? and e.is_deleted = 0 and v.id = e.current_version_id
				order by v.created_at;`,
			params: [entityId],
			rowMode: 'object'
		}) as unknown as ContentItemDto[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND})
		}

		return {
			...results[0],
			// todo: have separate database dto type with fields as string, or parse directly in db call?
			fields: JSON.parse(results[0].fields as unknown as string),
		}
	}

	async query(databaseId: string, options?: GlobalListingOptions): Promise<ContentItemDto[]> {
		console.debug(`[database] running get content items`)

		const results = await this.databaseService.exec({
			databaseId,
			sql: `
				select
					e.id as id,
					e.created_at as createdAt,
					v.created_at as updatedAt,
					e.is_deleted as isDeleted,
					v.id as versionId,
					v.previous_version_id as previousVersionId,
					v.created_by as createdBy,
          v.type as type,
          v.name as name,
          v.is_favourite as isFavourite,
          v.fields as fields
				from content_items e
				inner join content_items_versions v on e.id = v.entity_id
				where e.is_deleted = 0 and v.id = e.current_version_id
				order by v.created_at;`,
			params: [],
			rowMode: 'object'
		}) as unknown as ContentItemDto[];

		return results.map(result => {
			return {
				...result,
				// todo: have separate database dto type with templateFields as string, or parse directly in db call?
				fields: JSON.parse(result.fields as unknown as string),
			}
		})
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

		const results =  await this.databaseService.exec({
			databaseId,
			sql: `
				select
					v.id as id,
					v.created_at as createdAt,
					v.is_deleted as isDeleted,
					v.entity_id as entityId,
					v.previous_version_id as previousVersionId,
					v.created_by as createdBy,
          v.type as type,
          v.name as name,
          v.is_favourite as isFavourite,
          v.fields as fields
				from content_items_versions v
				where v.id = ? and v.is_deleted = 0`,
			params: [versionId],
			rowMode: 'object'
		}) as unknown as ContentItemVersionDto[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND})
		}

		return results[0]
	}

	async getVersions(databaseId: string, entityId: string) {
		console.debug(`[database] running getFieldVersions: ${entityId}`)

		return await this.databaseService.exec({
			databaseId,
			sql: `
				select
					v.id as id,
					v.created_at as createdAt,
					v.is_deleted as isDeleted,
					v.entity_id as entityId,
					v.previous_version_id as previousVersionId,
					v.created_by as createdBy,
          v.type as type,
          v.name as name,
          v.is_favourite as isFavourite,
          v.fields as fields
				from content_items_versions v
				where v.entity_id = ? and v.is_deleted = 0
				order by v.created_at`,
			params: [entityId],
			rowMode: 'object'
		}) as unknown as ContentItemVersionDto[];
	}

	async deleteVersion(databaseId: string, versionId: string): Promise<void> {
		const version = await this.getVersion(databaseId, versionId);
		const currentEntity = await this.get(databaseId, version.entityId);

		if (currentEntity.versionId === versionId) {
			// todo: need error type, or generic user input error type?
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: 'Attempted to delete current version'})
		}

		await this.databaseService.exec({
			databaseId,
			sql: `delete from content_items_versions where id = ?`,
			params: [versionId]
		})

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
