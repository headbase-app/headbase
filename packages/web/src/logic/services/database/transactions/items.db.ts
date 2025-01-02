import {DataChangeEvent, EventTypes} from "../../events/events.ts";
import {and, desc, eq, SQL} from "drizzle-orm";
import {ErrorTypes, HeadbaseError, LiveQueryResult} from "../../../control-flow.ts";
import {Observable} from "rxjs";
import {GlobalListingOptions} from "../db.ts";
import {DeviceContext, IEventsService} from "../../interfaces.ts";
import {HEADBASE_VERSION} from "../../../headbase-web.ts";
import {
	ContentItemDto,
	ContentItemVersionDto,
	CreateContentItemDto,
	UpdateContentItemDto
} from "../../../schemas/content-items/dtos.ts";
import {contentItems, contentItemsVersions} from "../schemas/tables/content-items.ts";
import {EntityTransactionsConfig} from "./fields.db.ts";
import {SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {DatabaseSchema} from "../schemas/schema.ts";


export class ContentItemTransactions {
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

	async create(createDto: CreateContentItemDto): Promise<ContentItemDto> {
		const databaseId = this.getDatabaseId()

		const entityId = self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.drizzleDatabase
			.insert(contentItems)
			.values({
				id: entityId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				currentVersionId: versionId
			})

		await this.drizzleDatabase
			.insert(contentItemsVersions)
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
				isFavourite: createDto.isFavourite,
				fields: createDto.fields,
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

		return this.get(entityId)
	}

	async update(entityId: string, updateDto: UpdateContentItemDto): Promise<ContentItemDto> {
		const databaseId = this.getDatabaseId()

		const currentEntity = await this.get(entityId)

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		await this.drizzleDatabase
			.update(contentItems)
			.set({
				currentVersionId: versionId,
			})
			.where(eq(contentItems.id, entityId))

		await this.drizzleDatabase
			.insert(contentItemsVersions)
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
				isFavourite: updateDto.isFavourite,
				fields: updateDto.fields,
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

		// Return the updated field
		// todo: do this via "returning" in version insert?
		return this.get(entityId)
	}

	async delete(entityId: string): Promise<void> {
		const databaseId = this.getDatabaseId()
		console.debug(`[database] running delete field: ${entityId}`)

		// todo: throw error on?

		await this.drizzleDatabase
			.update(contentItems)
			.set({
				isDeleted: true,
			})
			.where(eq(contentItems.id, entityId))

		// todo: should retain latest version just in case?
		await this.drizzleDatabase
			.delete(contentItemsVersions)
			.where(eq(contentItemsVersions.entityId, entityId))

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

	async get(entityId: string): Promise<ContentItemDto> {
		const results = await this.drizzleDatabase
			.select({
				id: contentItems.id,
				createdAt: contentItems.createdAt,
				updatedAt: contentItemsVersions.createdAt,
				isDeleted: contentItems.isDeleted,
				versionId: contentItemsVersions.id,
				previousVersionId: contentItemsVersions.previousVersionId,
				versionCreatedBy: contentItemsVersions.createdBy,
				// Custom fields
				type: contentItemsVersions.type,
				name: contentItemsVersions.name,
				isFavourite: contentItemsVersions.isFavourite,
				fields: contentItemsVersions.fields,
			})
			.from(contentItems)
			.innerJoin(contentItemsVersions, eq(contentItems.id, contentItemsVersions.entityId))
			.where(
				and(
					eq(contentItems.id, entityId),
					eq(contentItems.currentVersionId, contentItemsVersions.id)
				)
			)
			.orderBy(desc(contentItemsVersions.createdAt));

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND})
		}

		return results[0] as unknown as ContentItemDto;
	}

	async query(options?: GlobalListingOptions): Promise<ContentItemDto[]> {
		const filters: SQL[] = [
			eq(contentItems.currentVersionId, contentItemsVersions.id)
		]
		if (typeof options?.filter?.isDeleted === 'boolean') {
			filters.push(
				eq(contentItems.isDeleted, options?.filter.isDeleted)
			)
		}

		const order: SQL = desc(contentItemsVersions.createdAt)

		return this.drizzleDatabase
			.select({
				id: contentItems.id,
				createdAt: contentItems.createdAt,
				updatedAt: contentItemsVersions.createdAt,
				isDeleted: contentItems.isDeleted,
				versionId: contentItemsVersions.id,
				previousVersionId: contentItemsVersions.previousVersionId,
				versionCreatedBy: contentItemsVersions.createdBy,
				// Custom fields
				type: contentItemsVersions.type,
				name: contentItemsVersions.name,
				isFavourite: contentItemsVersions.isFavourite,
				fields: contentItemsVersions.fields,
			})
			.from(contentItems)
			.innerJoin(contentItemsVersions, eq(contentItems.id, contentItemsVersions.entityId))
			.where(and(...filters))
			.orderBy(order) as unknown as ContentItemDto[];
	}

	liveGet(entityId: string) {
		return new Observable<LiveQueryResult<ContentItemDto>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.get(entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.databaseId &&
					e.detail.data.tableKey === 'content_items' &&
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
		return new Observable<LiveQueryResult<ContentItemDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.query(options);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.databaseId &&
					e.detail.data.tableKey === 'content_items'
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
				id: contentItemsVersions.id,
				createdAt: contentItemsVersions.createdAt,
				isDeleted: contentItemsVersions.isDeleted,
				entityId: contentItemsVersions.id,
				previousVersionId: contentItemsVersions.previousVersionId,
				versionCreatedBy: contentItemsVersions.createdBy,
				// Custom fields
				type: contentItemsVersions.type,
				name: contentItemsVersions.name,
				isFavourite: contentItemsVersions.isFavourite,
				fields: contentItemsVersions.fields,
			})
			.from(contentItemsVersions)
			.where(eq(contentItemsVersions.id, versionId)) as unknown as ContentItemVersionDto;
	}

	async getVersions(entityId: string) {
		return this.drizzleDatabase
			.select({
				id: contentItemsVersions.id,
				createdAt: contentItemsVersions.createdAt,
				isDeleted: contentItemsVersions.isDeleted,
				entityId: contentItemsVersions.id,
				previousVersionId: contentItemsVersions.previousVersionId,
				versionCreatedBy: contentItemsVersions.createdBy,
				// Custom fields
				type: contentItemsVersions.type,
				name: contentItemsVersions.name,
				isFavourite: contentItemsVersions.isFavourite,
				fields: contentItemsVersions.fields,
			})
			.from(contentItemsVersions)
			.where(eq(contentItemsVersions.entityId, entityId))
			.orderBy(desc(contentItemsVersions.createdAt)) as unknown as ContentItemVersionDto[];
	}

	async deleteVersion(versionId: string): Promise<void> {
		const databaseId = this.getDatabaseId()

		const version = await this.drizzleDatabase
			.select({id: contentItemsVersions.id, entityId: contentItemsVersions.entityId})
			.from(contentItemsVersions)
			.where(eq(contentItemsVersions.id, versionId))
		if (!version) {
			throw new Error('Version not found')
		}

		const currentEntity = await this.drizzleDatabase
			.select({id: contentItems.id, currentVersionId: contentItems.currentVersionId})
			.from(contentItems)
			.where(eq(contentItems.id, version[0].entityId))
		if (!currentEntity) {
			throw new Error('Entity for version not found')
		}

		if (currentEntity[0].currentVersionId === versionId) {
			throw new Error('Attempted to delete current version')
		}

		await this.drizzleDatabase
			.delete(contentItemsVersions)
			.where(eq(contentItemsVersions.id, versionId))

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'content_items',
				id: currentEntity[0].id,
				action: 'delete-version'
			}
		})
	}

	liveGetVersions(entityId: string) {
		return new Observable<LiveQueryResult<ContentItemVersionDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getVersions(entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.databaseId &&
					e.detail.data.tableKey === 'content_items' &&
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
