import {CreateFieldDto, FieldDto, FieldVersionDto, UpdateFieldDto} from "../../../schemas/fields/dtos.ts";
import {fields, fieldsVersions} from "../schemas/tables/fields.ts";
import {DataChangeEvent, EventTypes} from "../../events/events.ts";
import {and, desc, eq, SQL} from "drizzle-orm";
import {ErrorTypes, HeadbaseError, LiveQueryResult} from "../../../control-flow.ts";
import {Observable} from "rxjs";
import {GlobalListingOptions} from "../db.ts";
import {DeviceContext, IEventsService} from "../../interfaces.ts";
import {HEADBASE_VERSION} from "../../../headbase-web.ts";
import {SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {DatabaseSchema} from "../schemas/schema.ts";

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
		private readonly drizzleDatabase: SqliteRemoteDatabase<typeof DatabaseSchema>
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

		const entityId = self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.drizzleDatabase
			.insert(fields)
			.values({
				id: entityId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				currentVersionId: versionId
			})

		await this.drizzleDatabase
			.insert(fieldsVersions)
			.values({
				id: versionId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId: entityId,
				previousVersionId: null,
				createdBy: createDto.createdBy,
				type: createDto.type,
				name: createDto.name,
				description: createDto.description,
				icon: createDto.icon,
				settings: 'settings' in createDto ? createDto.settings : null,
			})

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

		await this.drizzleDatabase
			.update(fields)
			.set({
				currentVersionId: versionId,
			})
			.where(eq(fields.id, entityId))

		await this.drizzleDatabase
			.insert(fieldsVersions)
			.values({
				id: versionId,
				createdAt: updatedAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId,
				previousVersionId: currentEntity.versionId,
				createdBy: updateDto.createdBy,
				type: updateDto.type,
				name: updateDto.name,
				description: updateDto.description,
				icon: updateDto.icon,
				settings: 'settings' in updateDto ? updateDto.settings : null,
			})

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

		// todo: throw error on?

		await this.drizzleDatabase
			.update(fields)
			.set({
				isDeleted: true,
			})
			.where(eq(fields.id, entityId))

		await this.drizzleDatabase
			.delete(fieldsVersions)
			.where(eq(fieldsVersions.entityId, entityId))

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

		const results = await this.drizzleDatabase
			.select({
				id: fields.id,
				createdAt: fields.createdAt,
				updatedAt: fieldsVersions.createdAt,
				isDeleted: fields.isDeleted,
				versionId: fieldsVersions.id,
				previousVersionId: fieldsVersions.previousVersionId,
				versionCreatedBy: fieldsVersions.createdBy,
				type: fieldsVersions.type,
				name: fieldsVersions.name,
				description: fieldsVersions.description,
				icon: fieldsVersions.icon,
				settings: fieldsVersions.settings,
			})
			.from(fields)
			.innerJoin(fieldsVersions, eq(fields.id, fieldsVersions.entityId))
			.where(
				and(
					eq(fields.id, entityId),
					eq(fields.currentVersionId, fieldsVersions.id)
				)
			)
			.orderBy(desc(fieldsVersions.createdAt));

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND})
		}

		return results[0] as unknown as FieldDto
	}

	async query(options?: GlobalListingOptions): Promise<FieldDto[]> {
		console.debug(`[database] running get fields`)

		const filters: SQL[] = [
			eq(fields.currentVersionId, fieldsVersions.id)
		]
		if (typeof options?.filter?.isDeleted === 'boolean') {
			filters.push(
				eq(fields.isDeleted, options?.filter.isDeleted)
			)
		}

		const order: SQL = desc(fieldsVersions.createdAt)

		return this.drizzleDatabase
			.select({
				id: fields.id,
				createdAt: fields.createdAt,
				updatedAt: fieldsVersions.createdAt,
				isDeleted: fields.isDeleted,
				versionId: fieldsVersions.id,
				previousVersionId: fieldsVersions.previousVersionId,
				versionCreatedBy: fieldsVersions.createdBy,
				type: fieldsVersions.type,
				name: fieldsVersions.name,
				description: fieldsVersions.description,
				icon: fieldsVersions.icon,
				settings: fieldsVersions.settings,
			})
			.from(fields)
			.innerJoin(fieldsVersions, eq(fields.id, fieldsVersions.entityId))
			.where(and(...filters))
			.orderBy(order) as unknown as FieldDto[];
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

		return this.drizzleDatabase
			.select({
				id: fieldsVersions.id,
				createdAt: fieldsVersions.createdAt,
				isDeleted: fieldsVersions.isDeleted,
				entityId: fieldsVersions.id,
				previousVersionId: fieldsVersions.previousVersionId,
				versionCreatedBy: fieldsVersions.createdBy,
				type: fieldsVersions.type,
				name: fieldsVersions.name,
				description: fieldsVersions.description,
				icon: fieldsVersions.icon,
				settings: fieldsVersions.settings,
			})
			.from(fieldsVersions)
			.where(eq(fieldsVersions.id, versionId)) as unknown as FieldVersionDto;
	}

	async getVersions(entityId: string) {
		console.debug(`[database] running getFieldVersions: ${entityId}`)

		return this.drizzleDatabase
			.select({
				id: fieldsVersions.id,
				createdAt: fieldsVersions.createdAt,
				isDeleted: fieldsVersions.isDeleted,
				entityId: fieldsVersions.id,
				previousVersionId: fieldsVersions.previousVersionId,
				versionCreatedBy: fieldsVersions.createdBy,
				type: fieldsVersions.type,
				name: fieldsVersions.name,
				description: fieldsVersions.description,
				icon: fieldsVersions.icon,
				settings: fieldsVersions.settings,
			})
			.from(fieldsVersions)
			.where(eq(fieldsVersions.entityId, entityId))
			.orderBy(desc(fieldsVersions.createdAt)) as unknown as FieldVersionDto[];
	}

	async deleteVersion(versionId: string): Promise<void> {
		const databaseId = this.getDatabaseId();

		const version = await this.drizzleDatabase
			.select({id: fieldsVersions.id, entityId: fieldsVersions.entityId})
			.from(fieldsVersions)
			.where(eq(fieldsVersions.id, versionId))
		if (!version) {
			throw new Error('Version not found')
		}

		const currentEntity = await this.drizzleDatabase
			.select({id: fields.id, currentVersionId: fields.currentVersionId})
			.from(fields)
			.where(eq(fields.id, version[0].entityId))
		if (!currentEntity) {
			throw new Error('Entity for version not found')
		}

		if (currentEntity[0].currentVersionId === versionId) {
			throw new Error('Attempted to delete current version')
		}

		await this.drizzleDatabase
			.delete(fieldsVersions)
			.where(eq(fieldsVersions.id, versionId))

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'fields',
				id: currentEntity[0].id,
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
