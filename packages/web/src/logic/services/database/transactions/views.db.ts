import {CreateViewDto, ViewDto, ViewVersionDto, UpdateViewDto} from "../../../schemas/views/dtos.ts";
import {DataChangeEvent, EventTypes} from "../../events/events.ts";
import {ErrorTypes, HeadbaseError, LiveQueryResult} from "../../../control-flow.ts";
import {Observable} from "rxjs";
import {GlobalListingOptions} from "../db.ts";
import {DeviceContext, IDatabaseService, IEventsService} from "../../interfaces.ts";
import {HEADBASE_VERSION} from "../../../headbase-web.ts";

export interface EntityTransactionsConfig {
	context: DeviceContext;
}


export class ViewTransactions {
	private readonly context: DeviceContext;

	constructor(
		config: EntityTransactionsConfig,
		private readonly eventsService: IEventsService,
		private readonly databaseService: IDatabaseService
	) {
		this.context = config.context
	}
	
	async create(databaseId: string, createDto: CreateViewDto): Promise<ViewDto> {
		console.debug(`[database] running create view`)

		const entityId = createDto.id || self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.databaseService.exec({
			databaseId,
			sql: `insert into views(id, created_at, is_deleted, hbv, current_version_id) values (?, ?, ?, ?, ?)`,
			params: [entityId, createdAt, 0, HEADBASE_VERSION, versionId]
		})

		await this.databaseService.exec({
			databaseId,
			sql: `
				insert into views_versions(
					id, created_at, is_deleted, hbv, entity_id, previous_version_id, created_by,
					type, name, icon, colour, description, is_favourite, settings
				) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			params: [
				versionId, createdAt, 0, HEADBASE_VERSION, entityId, null, createDto.createdBy,
				createDto.type, createDto.name, createDto.icon || null, createDto.colour || null, createDto.description || null, createDto.isFavourite,
				'settings' in createDto ? JSON.stringify(createDto.settings) : null,
			]
		})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'views',
				id: entityId,
				action: 'create'
			}
		})

		return this.get(databaseId, entityId)
	}

	async update(databaseId: string, entityId: string, updateDto: UpdateViewDto): Promise<ViewDto> {
		console.debug(`[database] running update view`)

		const currentEntity = await this.get(databaseId, entityId)

		if (currentEntity.type !== updateDto.type) {
			throw new Error('Attempted to change type of view')
		}

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		await this.databaseService.exec({
			databaseId,
			sql: `update views set current_version_id = ? where id = ?`,
			params: [versionId, entityId]
		})

		await this.databaseService.exec({
			databaseId,
			sql: `
				insert into views_versions(
					id, created_at, is_deleted, hbv, entity_id, previous_version_id, created_by,
					type, name, icon, colour, description, is_favourite, settings
				) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			params: [
				versionId, updatedAt, 0, HEADBASE_VERSION, entityId, null, updateDto.createdBy,
				updateDto.type, updateDto.name, updateDto.icon || null, updateDto.colour || null, updateDto.description || null, updateDto.isFavourite,
				'settings' in updateDto ? JSON.stringify(updateDto.settings) : null,
			]
		})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'views',
				id: entityId,
				action: 'update'
			}
		})

		// todo: do this via "return" sql instead?
		return this.get(databaseId, entityId)
	}

	async delete(databaseId: string, entityId: string): Promise<void> {
		console.debug(`[database] running delete view: ${entityId}`)

		// Will cause error if entity can't be found.
		await this.get(databaseId, entityId)

		await this.databaseService.exec({
			databaseId,
			sql: `update views set is_deleted = 1 where id = ?`,
			params: [entityId]
		})

		await this.databaseService.exec({
			databaseId,
			sql: `delete from views_versions where entity_id = ?`,
			params: [entityId]
		})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'views',
				id: entityId,
				action: 'delete'
			}
		})
	}

	async get(databaseId: string, entityId: string): Promise<ViewDto> {
		console.debug(`[database] running get view: ${entityId}`)

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
          v.icon as icon,
          v.colour as colour,
					v.description as description,
          v.is_favourite as isFavourite,
					v.settings as settings
				from views e
				inner join views_versions v on e.id = v.entity_id
				where e.id = ? and e.is_deleted = 0 and v.id = e.current_version_id
				order by v.created_at;`,
			params: [entityId],
			rowMode: 'object'
		}) as unknown as ViewDto[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND})
		}

		return {
			...results[0],
			// todo: have separate database dto type with settings as string, or parse directly in db call?
			settings: results[0].settings !== null ? JSON.parse(results[0].settings as unknown as string) : null,
		}
	}

	async query(databaseId: string, options?: GlobalListingOptions): Promise<ViewDto[]> {
		console.debug(`[database] running get views`)

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
          v.icon as icon,
          v.colour as colour,
          v.description as description,
          v.is_favourite as isFavourite,
          v.settings as settings
				from views e
				inner join views_versions v on e.id = v.entity_id
				where e.is_deleted = 0 and v.id = e.current_version_id
				order by v.created_at;`,
			params: [],
			rowMode: 'object'
		}) as unknown as ViewDto[];

		return results.map(result => {
			return {
				...result,
				// todo: have separate database dto type with settings as string, or parse directly in db call?
				settings: result.settings !== null ? JSON.parse(result.settings as unknown as string) : null,
			}
		})
	}

	liveGet(databaseId: string, entityId: string) {
		return new Observable<LiveQueryResult<ViewDto>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.get(databaseId, entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.tableKey === 'views' &&
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
		return new Observable<LiveQueryResult<ViewDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.query(databaseId, options);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.tableKey === 'views'
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
		console.debug(`[database] running getViewVersion: ${versionId}`)

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
					v.description as description,
					v.icon as icon,
					v.settings as settings
				from views_versions v
				where v.id = ? and v.is_deleted = 0`,
			params: [versionId],
			rowMode: 'object'
		}) as unknown as ViewVersionDto[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND})
		}

		return results[0]
	}

	async getVersions(databaseId: string, entityId: string) {
		console.debug(`[database] running getViewVersions: ${entityId}`)

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
          v.icon as icon,
          v.colour as colour,
          v.description as description,
          v.is_favourite as isFavourite,
          v.settings as settings
				from views_versions v
				where v.entity_id = ? and v.is_deleted = 0
				order by v.created_at`,
			params: [entityId],
			rowMode: 'object'
		}) as unknown as ViewVersionDto[];
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
			sql: `delete from views_versions where id = ?`,
			params: [versionId]
		})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'views',
				id: currentEntity.id,
				// todo: should include version id in event?
				action: 'delete-version'
			}
		})
	}

	liveGetVersions(databaseId: string, entityId: string) {
		return new Observable<LiveQueryResult<ViewVersionDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getVersions(databaseId, entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === databaseId &&
					e.detail.data.tableKey === 'views' &&
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