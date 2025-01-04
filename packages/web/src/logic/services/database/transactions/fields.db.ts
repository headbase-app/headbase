import {CreateFieldDto, FieldDto, FieldVersionDto, UpdateFieldDto} from "../../../schemas/fields/dtos.ts";
import {DataChangeEvent, EventTypes} from "../../events/events.ts";
import {ErrorTypes, HeadbaseError, LiveQueryResult} from "../../../control-flow.ts";
import {Observable} from "rxjs";
import {GlobalListingOptions} from "../db.ts";
import {DeviceContext, IDatabaseService, IEventsService} from "../../interfaces.ts";
import {HEADBASE_VERSION} from "../../../headbase-web.ts";

export interface EntityTransactionsConfig {
	context: DeviceContext;
	databaseId: string | null;
}


export class FieldTransactions {
	private readonly context: DeviceContext;
	private databaseId: string | null;

	constructor(
		config: EntityTransactionsConfig,
		private readonly eventsService: IEventsService,
		private readonly databaseService: IDatabaseService
	) {
		this.databaseId = config.databaseId
		this.context = config.context
	}

	setDatabaseId(databaseId: string | null): void {
		this.databaseId = databaseId;
	}

	getDatabaseId(): string {
		if (!this.databaseId) {
			throw new Error("Attempted to run database query with no open database")
		}

		return this.databaseId;
	}
	
	async create(createDto: CreateFieldDto): Promise<FieldDto> {
		console.debug(`[database] running create field`)
		const databaseId = this.getDatabaseId();

		const entityId = createDto.id || self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.databaseService.exec(
			databaseId,
			`insert into fields(id, created_at, is_deleted, hbv, current_version_id) values (?, ?, ?, ?, ?)`,
			[entityId, createdAt, 0, HEADBASE_VERSION, versionId]
		)

		await this.databaseService.exec(
			databaseId,
			`insert into fields_versions(id, created_at, is_deleted, hbv, entity_id, previous_version_id, created_by, type, name, description, icon, settings) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				versionId, createdAt, 0, HEADBASE_VERSION, entityId, null, createDto.createdBy,
				createDto.type, createDto.name, createDto.description || null, createDto.icon || null,
				'settings' in createDto ? JSON.stringify(createDto.settings) : null,
			]
		)

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'fields',
				id: entityId,
				action: 'create'
			}
		})

		return this.get(entityId)
	}

	async update(entityId: string, updateDto: UpdateFieldDto): Promise<FieldDto> {
		console.debug(`[database] running update field`)
		const databaseId = this.getDatabaseId();

		const currentEntity = await this.get(entityId)

		if (currentEntity.type !== updateDto.type) {
			throw new Error('Attempted to change type of field')
		}

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		await this.databaseService.exec(
			databaseId,
			`update fields set current_version_id = ? where id = ?`,
			[versionId, entityId]
		)

		await this.databaseService.exec(
			databaseId,
			`insert into fields_versions(id, created_at, is_deleted, hbv, entity_id, previous_version_id, created_by, type, name, description, icon, settings) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				versionId, updatedAt, 0, HEADBASE_VERSION, entityId, currentEntity.versionId, updateDto.createdBy,
				updateDto.type, updateDto.name, updateDto.description || null, updateDto.icon || null,
				'settings' in updateDto ? JSON.stringify(updateDto.settings) : null,
			]
		)

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'fields',
				id: entityId,
				action: 'update'
			}
		})

		// Return the updated field
		// todo: do this via "returning" in version insert?
		return this.get(entityId)
	}

	async delete(entityId: string): Promise<void> {
		console.debug(`[database] running delete field: ${entityId}`)
		const databaseId = this.getDatabaseId();

		// todo: throw error if not found?

		await this.databaseService.exec(
			databaseId,
			`update fields set is_deleted = 1 where id = ?`,
			[entityId]
		)

		await this.databaseService.exec(
			databaseId,
			`delete from fields_versions where entity_id = ?`,
			[entityId]
		)

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

	async get(entityId: string): Promise<FieldDto> {
		console.debug(`[database] running get field: ${entityId}`)
		const databaseId = this.getDatabaseId();

		const results = await this.databaseService.exec(
			databaseId,
			`select
					e.id as id,
					e.created_at as createdAt,
					v.created_at as updatedAt,
					e.is_deleted as isDeleted,
					v.id as versionId,
					v.previous_version_id as previousVersionId,
					v.created_by as createdBy,
					v.type as type,
					v.name as name,
					v.description as description,
					v.icon as icon,
					v.settings as settings
				from fields e
				inner join fields_versions v on e.id = v.entity_id
				where e.id = ? and v.id = e.current_version_id
				order by v.created_at;
			`,
			[entityId],
			'object'
		) as unknown as FieldDto[];

		console.debug(results)
		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND})
		}

		return {
			...results[0],
			settings: 'settings' in results[0] ? JSON.parse(results[0].settings) : undefined,
		}
	}

	async query(options?: GlobalListingOptions): Promise<FieldDto[]> {
		console.debug(`[database] running get fields`)
		const databaseId = this.getDatabaseId();

		const results = await this.databaseService.exec(
			databaseId,
			`
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
					v.description as description,
					v.icon as icon,
					v.settings as settings
				from fields e
				inner join fields_versions v on e.id = v.entity_id
				where e.is_deleted = ? and v.id = e.current_version_id
				order by v.created_at;
			`,
			[options?.filter?.isDeleted ? 1 : 0],
			'object'
		) as unknown as FieldDto[];

		return results.map(result => {
			return {
				...result,
				settings: 'settings' in result ? JSON.parse(result.settings) : undefined,
			}
		})
	}

	liveGet(entityId: string) {
		return new Observable<LiveQueryResult<FieldDto>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.get(entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.databaseId &&
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

	liveQuery(options?: GlobalListingOptions) {
		return new Observable<LiveQueryResult<FieldDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.query(options);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.databaseId &&
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

	async getVersion(versionId: string) {
		console.debug(`[database] running getFieldVersion: ${versionId}`)
		const databaseId = this.getDatabaseId()

		const results =  await this.databaseService.exec(
			databaseId,
			`
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
				from fields_versions v
				where v.id = ?
			`,
			[versionId],
			'object'
		) as unknown as FieldVersionDto[];

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.VERSION_NOT_FOUND})
		}

		return results[0]
	}

	async getVersions(entityId: string) {
		console.debug(`[database] running getFieldVersions: ${entityId}`)
		const databaseId = this.getDatabaseId()

		return await this.databaseService.exec(
			databaseId,
			`
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
				from fields_versions v
				where v.entity_id = ?
				order by v.created_at,
			`,
			[entityId],
			'object'
		) as unknown as FieldVersionDto[];
	}

	async deleteVersion(versionId: string): Promise<void> {
		const databaseId = this.getDatabaseId();

		const version = await this.getVersion(versionId);
		const currentEntity = await this.get(version.entityId);

		if (currentEntity.versionId === versionId) {
			// todo: need error type, or generic user input error type?
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: 'Attempted to delete current version'})
		}

		await this.databaseService.exec(
			databaseId,
			`delete from fields_versions where id = ?`,
			[versionId]
		)

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

	liveGetVersions(entityId: string) {
		return new Observable<LiveQueryResult<FieldVersionDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getVersions(entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.databaseId &&
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
