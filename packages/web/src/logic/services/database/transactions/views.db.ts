import {CreateViewDto, ViewDto, ViewVersionDto, UpdateViewDto} from "../../../schemas/views/dtos.ts";
import {DataChangeEvent, EventTypes} from "../../events/events.ts";
import {ErrorTypes, HeadbaseError, LiveQueryResult} from "../../../control-flow.ts";
import {Observable} from "rxjs";
import {GlobalListingOptions} from "../db.ts";
import {DeviceContext, IDatabaseService, IEventsService} from "../../interfaces.ts";
import {DatabaseView, DatabaseViewVersion, views, viewsVersions} from "./drizzle/tables/views.ts";
import {sqlBuilder} from "./drizzle/sql-builder.ts";
import {and, eq} from "drizzle-orm";
import {HEADBASE_VERSION} from "../../../headbase-web.ts";
import {ColourField} from "../../../schemas/common/fields.ts";

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

	static mapDatabaseEntityToDto(result: DatabaseView): ViewDto {
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
			type: result.type,
			name: result.name,
			icon: result.icon,
			colour: result.colour as ColourField,
			description: result.description,
			isFavourite: result.is_favourite === 1,
			settings: JSON.parse(result.settings as string),
		}
	}

	static mapDatabaseVersionToDto(result: DatabaseViewVersion): ViewVersionDto {
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
			type: result.type,
			name: result.name,
			icon: result.icon,
			colour: result.colour as ColourField,
			description: result.description,
			isFavourite: result.is_favourite === 1,
			settings: JSON.parse(result.settings as string),
		}
	}
	
	async create(databaseId: string, createDto: CreateViewDto): Promise<ViewDto> {
		console.debug(`[database] running create view`)

		const entityId = createDto.id || self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		const createQuery = sqlBuilder
			.insert(views)
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
				colour: createDto.colour,
				description: createDto.description,
				is_favourite: createDto.isFavourite ? 1 : 0,
				settings: createDto.settings
			})
			.toSQL()
		await this.databaseService.exec({databaseId, ...createQuery})

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

		const updateQuery = sqlBuilder
			.update(views)
			.set({
				version_id: versionId,
				previous_version_id: currentEntity.previousVersionId,
				updated_at: updatedAt,
				updated_by: updateDto.createdBy,
				type: updateDto.type,
				name: updateDto.name,
				icon: updateDto.icon,
				colour: updateDto.colour,
				description: updateDto.description,
				is_favourite: updateDto.isFavourite ? 1 : 0,
				settings: updateDto.settings
			})
			.toSQL()
		await this.databaseService.exec({databaseId, ...updateQuery})

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

		const deleteQuery = sqlBuilder
			.update(views)
			.set({
				is_deleted: 1,
			})
			.where(eq(views.id, entityId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...deleteQuery})

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

		const selectQuery = sqlBuilder
			.select()
			.from(views)
			.where(and(eq(views.id, entityId), eq(views.is_deleted, 0)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseView[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND})
		}

		return ViewTransactions.mapDatabaseEntityToDto(results[0])
	}

	async query(databaseId: string, options?: GlobalListingOptions): Promise<ViewDto[]> {
		console.debug(`[database] running get views`)

		const selectQuery = sqlBuilder
			.select()
			.from(views)
			.where(eq(views.is_deleted, 0))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseView[];

		return results.map(ViewTransactions.mapDatabaseEntityToDto)
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

		const selectQuery = sqlBuilder
			.select()
			.from(viewsVersions)
			.where(and(eq(viewsVersions.id, versionId), eq(viewsVersions.is_deleted, 0)))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseViewVersion[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND})
		}

		return ViewTransactions.mapDatabaseVersionToDto(results[0])
	}

	async getVersions(databaseId: string, entityId: string) {
		console.debug(`[database] running getViewVersions: ${entityId}`)

		const selectQuery = sqlBuilder
			.select()
			.from(viewsVersions)
			.where(eq(viewsVersions.is_deleted, 0))
			.toSQL()
		const results = await this.databaseService.exec({databaseId, ...selectQuery, rowMode: 'object'}) as unknown as DatabaseViewVersion[];

		return results.map(ViewTransactions.mapDatabaseVersionToDto)
	}

	async deleteVersion(databaseId: string, versionId: string): Promise<void> {
		const version = await this.getVersion(databaseId, versionId);
		const currentEntity = await this.get(databaseId, version.entityId);

		if (currentEntity.versionId === versionId) {
			// todo: need error type, or generic user input error type?
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: 'Attempted to delete current version'})
		}

		const deleteQuery = sqlBuilder
			.update(viewsVersions)
			.set({
				is_deleted: 1,
			})
			.where(eq(viewsVersions.id, versionId))
			.toSQL()
		await this.databaseService.exec({databaseId, ...deleteQuery})

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
