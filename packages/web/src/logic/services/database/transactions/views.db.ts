import {DataChangeEvent, EventTypes} from "../../events/events.ts";
import {and, desc, eq, SQL} from "drizzle-orm";
import {ErrorTypes, HeadbaseError, LiveQueryResult} from "../../../control-flow.ts";
import {Observable} from "rxjs";
import {GlobalListingOptions} from "../db.ts";
import {DeviceContext, IEventsService} from "../../interfaces.ts";
import {HEADBASE_VERSION} from "../../../headbase-web.ts";
import {EntityTransactionsConfig} from "./fields.db.ts";
import {CreateViewDto, UpdateViewDto, ViewDto, ViewVersionDto} from "../../../schemas/views/dtos.ts";
import {views, viewsVersions} from "../schemas/tables/views.ts";
import {SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {DatabaseSchema} from "../schemas/schema.ts";


export class ViewTransactions {
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

	async create(createDto: CreateViewDto): Promise<ViewDto> {
		const databaseId = this.getDatabaseId()

		const entityId = createDto.id || self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.drizzleDatabase
			.insert(views)
			.values({
				id: entityId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				currentVersionId: versionId
			})

		await this.drizzleDatabase
			.insert(viewsVersions)
			.values({
				id: versionId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId: entityId,
				previousVersionId: null,
				createdBy: createDto.createdBy,
				// Custom data
				type: createDto.type,
				name: createDto.name,
				icon: createDto.icon,
				colour: createDto.colour,
				description: createDto.description,
				isFavourite: createDto.isFavourite,
				settings: createDto.settings,
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

		return this.get(entityId)
	}

	async update(entityId: string, updateDto: UpdateViewDto): Promise<ViewDto> {
		const databaseId = this.getDatabaseId()

		const currentEntity = await this.get(entityId)

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		await this.drizzleDatabase
			.update(views)
			.set({
				currentVersionId: versionId,
			})
			.where(eq(views.id, entityId))

		await this.drizzleDatabase
			.insert(viewsVersions)
			.values({
				id: versionId,
				createdAt: updatedAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId,
				previousVersionId: currentEntity.versionId,
				createdBy: updateDto.createdBy,
				// Custom fields
				type: updateDto.type,
				name: updateDto.name,
				icon: updateDto.icon,
				colour: updateDto.colour,
				description: updateDto.description,
				isFavourite: updateDto.isFavourite,
				settings: updateDto.settings,
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

		// Return the updated field
		// todo: do this via "returning" in version insert?
		return this.get(entityId)
	}

	async delete(entityId: string): Promise<void> {
		const databaseId = this.getDatabaseId()
		// todo: throw error on not existing?

		await this.drizzleDatabase
			.update(views)
			.set({
				isDeleted: true,
			})
			.where(eq(views.id, entityId))

		// todo: should retain latest version just in case?
		await this.drizzleDatabase
			.delete(viewsVersions)
			.where(eq(viewsVersions.entityId, entityId))

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

	async get(entityId: string): Promise<ViewDto> {
		const results = await this.drizzleDatabase
			.select({
				id: views.id,
				createdAt: views.createdAt,
				updatedAt: viewsVersions.createdAt,
				isDeleted: views.isDeleted,
				versionId: viewsVersions.id,
				previousVersionId: viewsVersions.previousVersionId,
				versionCreatedBy: viewsVersions.createdBy,
				// Custom fields
				type: viewsVersions.type,
				name: viewsVersions.name,
				icon: viewsVersions.icon,
				colour: viewsVersions.colour,
				description: viewsVersions.description,
				isFavourite: viewsVersions.isFavourite,
				settings: viewsVersions.settings,
			})
			.from(views)
			.innerJoin(viewsVersions, eq(views.id, viewsVersions.entityId))
			.where(
				and(
					eq(views.id, entityId),
					eq(views.currentVersionId, viewsVersions.id)
				)
			)
			.orderBy(desc(viewsVersions.createdAt))

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND})
		}

		return results[0] as unknown as ViewDto;
	}

	async query(options?: GlobalListingOptions): Promise<ViewDto[]> {
		const filters: SQL[] = [
			eq(views.currentVersionId, viewsVersions.id)
		]
		if (typeof options?.filter?.isDeleted === 'boolean') {
			filters.push(
				eq(views.isDeleted, options?.filter.isDeleted)
			)
		}

		const order: SQL = desc(viewsVersions.createdAt)

		return this.drizzleDatabase
			.select({
				id: views.id,
				createdAt: views.createdAt,
				updatedAt: viewsVersions.createdAt,
				isDeleted: views.isDeleted,
				versionId: viewsVersions.id,
				previousVersionId: viewsVersions.previousVersionId,
				versionCreatedBy: viewsVersions.createdBy,
				// Custom fields
				type: viewsVersions.type,
				name: viewsVersions.name,
				icon: viewsVersions.icon,
				colour: viewsVersions.colour,
				description: viewsVersions.description,
				isFavourite: viewsVersions.isFavourite,
				settings: viewsVersions.settings,
			})
			.from(views)
			.innerJoin(viewsVersions, eq(views.id, viewsVersions.entityId))
			.where(and(...filters))
			.orderBy(order) as unknown as ViewDto[];
	}

	liveGet(entityId: string) {
		return new Observable<LiveQueryResult<ViewDto>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.get(entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.databaseId &&
					e.detail.data.tableKey === 'views' &&
					e.detail.data.id === entityId
				) {
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
		return new Observable<LiveQueryResult<ViewDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.query(options);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.databaseId &&
					e.detail.data.tableKey === 'views'
				) {
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
		return this.drizzleDatabase
			.select({
				id: viewsVersions.id,
				createdAt: viewsVersions.createdAt,
				isDeleted: viewsVersions.isDeleted,
				entityId: viewsVersions.id,
				previousVersionId: viewsVersions.previousVersionId,
				versionCreatedBy: viewsVersions.createdBy,
				// Custom fields
				type: viewsVersions.type,
				name: viewsVersions.name,
				icon: viewsVersions.icon,
				colour: viewsVersions.colour,
				description: viewsVersions.description,
				isFavourite: viewsVersions.isFavourite,
				settings: viewsVersions.settings,
			})
			.from(viewsVersions)
			.where(eq(viewsVersions.id, versionId)) as unknown as ViewVersionDto;
	}

	async getVersions(entityId: string) {
		return this.drizzleDatabase
			.select({
				id: viewsVersions.id,
				createdAt: viewsVersions.createdAt,
				isDeleted: viewsVersions.isDeleted,
				entityId: viewsVersions.id,
				previousVersionId: viewsVersions.previousVersionId,
				versionCreatedBy: viewsVersions.createdBy,
				// Custom fields
				type: viewsVersions.type,
				name: viewsVersions.name,
				icon: viewsVersions.icon,
				colour: viewsVersions.colour,
				description: viewsVersions.description,
				isFavourite: viewsVersions.isFavourite,
				settings: viewsVersions.settings,
			})
			.from(viewsVersions)
			.where(eq(viewsVersions.entityId, entityId))
			.orderBy(desc(viewsVersions.createdAt)) as unknown as ViewVersionDto[];
	}

	async deleteVersion(versionId: string): Promise<void> {
		const databaseId = this.getDatabaseId()

		const version = await this.drizzleDatabase
			.select({id: viewsVersions.id, entityId: viewsVersions.entityId})
			.from(viewsVersions)
			.where(eq(viewsVersions.id, versionId))
		if (!version) {
			throw new Error('Version not found')
		}

		const currentEntity = await this.drizzleDatabase
			.select({id: views.id, currentVersionId: views.currentVersionId})
			.from(views)
			.where(eq(views.id, version[0].entityId))
		if (!currentEntity) {
			throw new Error('Entity for version not found')
		}

		if (currentEntity[0].currentVersionId === versionId) {
			throw new Error('Attempted to delete current version')
		}

		await this.drizzleDatabase
			.delete(viewsVersions)
			.where(eq(viewsVersions.id, versionId))

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'views',
				id: currentEntity[0].id,
				action: 'delete-version'
			}
		})
	}

	liveGetVersions(entityId: string) {
		return new Observable<LiveQueryResult<ViewVersionDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getVersions(entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.databaseId &&
					e.detail.data.tableKey === 'views' &&
					e.detail.data.id === entityId
				) {
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
