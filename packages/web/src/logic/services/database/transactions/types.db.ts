import {CreateFieldDto, FieldDto, FieldVersionDto, UpdateFieldDto} from "../../../schemas/fields/dtos.ts";
import {fields, fieldsVersions} from "../schemas/tables/fields.ts";
import {DataChangeEvent, EventTypes} from "../../events/events.ts";
import {and, desc, eq, SQL} from "drizzle-orm";
import {ErrorTypes, HeadbaseError, LiveQueryResult} from "../../../control-flow.ts";
import {Observable} from "rxjs";
import {GlobalListingOptions, TableSnapshot} from "../db.ts";
import {DeviceContext, IEventsService} from "../../interfaces.ts";
import {HEADBASE_VERSION} from "../../../headbase-web.ts";
import {
	ContentTypeDto,
	ContentTypeVersionDto,
	CreateContentTypeDto,
	UpdateContentTypeDto
} from "../../../schemas/content-types/dtos.ts";
import {contentTypes, contentTypesVersions} from "../schemas/tables/content-types.ts";
import {EntityTransactionsConfig} from "./fields.db.ts";
import {SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {DatabaseSchema} from "../schemas/schema.ts";


export class ContentTypeTransactions {
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

	async create(createDto: CreateContentTypeDto): Promise<ContentTypeDto> {
		const databaseId = this.getDatabaseId()

		const entityId = self.crypto.randomUUID()
		const versionId = self.crypto.randomUUID()
		const createdAt = new Date().toISOString()

		await this.drizzleDatabase
			.insert(contentTypes)
			.values({
				id: entityId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				currentVersionId: versionId
			})

		await this.drizzleDatabase
			.insert(contentTypesVersions)
			.values({
				id: versionId,
				createdAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId: entityId,
				previousVersionId: null,
				createdBy: createDto.createdBy,
				// Custom data
				name: createDto.name,
				icon: createDto.icon,
				colour: createDto.colour,
				description: createDto.description,
				templateName: createDto.templateName,
				templateFields: createDto.templateFields,
			})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'content_types',
				id: entityId,
				action: 'create'
			}
		})

		return this.get(entityId)
	}

	async update(entityId: string, updateDto: UpdateContentTypeDto): Promise<ContentTypeDto> {
		const databaseId = this.getDatabaseId()

		const currentEntity = await this.get(entityId)

		const versionId = self.crypto.randomUUID()
		const updatedAt = new Date().toISOString()

		await this.drizzleDatabase
			.update(contentTypes)
			.set({
				currentVersionId: versionId,
			})
			.where(eq(contentTypes.id, entityId))

		await this.drizzleDatabase
			.insert(contentTypesVersions)
			.values({
				id: versionId,
				createdAt: updatedAt,
				isDeleted: false,
				hbv: HEADBASE_VERSION,
				entityId,
				previousVersionId: currentEntity.versionId,
				createdBy: updateDto.createdBy,
				// Custom fields
				name: updateDto.name,
				icon: updateDto.icon,
				colour: updateDto.colour,
				description: updateDto.description,
				templateName: updateDto.templateName,
				templateFields: updateDto.templateFields,
			})

		this.eventsService.dispatch(EventTypes.DATA_CHANGE, {
			context: this.context,
			data: {
				databaseId,
				tableKey: 'content_types',
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
			.update(contentTypes)
			.set({
				isDeleted: true,
			})
			.where(eq(contentTypes.id, entityId))

		// todo: should retain latest version just in case?
		await this.drizzleDatabase
			.delete(contentTypesVersions)
			.where(eq(contentTypesVersions.entityId, entityId))

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

	async get(entityId: string): Promise<ContentTypeDto> {
		const results = await this.drizzleDatabase
			.select({
				id: contentTypes.id,
				createdAt: contentTypes.createdAt,
				updatedAt: contentTypesVersions.createdAt,
				isDeleted: contentTypes.isDeleted,
				versionId: contentTypesVersions.id,
				previousVersionId: contentTypesVersions.previousVersionId,
				versionCreatedBy: contentTypesVersions.createdBy,
				// Custom fields
				name: contentTypesVersions.name,
				icon: contentTypesVersions.icon,
				colour: contentTypesVersions.colour,
				description: contentTypesVersions.description,
				templateName: contentTypesVersions.templateName,
				templateFields: contentTypesVersions.templateFields,
			})
			.from(contentTypes)
			.innerJoin(contentTypesVersions, eq(contentTypes.id, contentTypesVersions.entityId))
			.where(
				and(
					eq(contentTypes.id, entityId),
					eq(contentTypes.currentVersionId, contentTypesVersions.id)
				)
			)
			.orderBy(desc(contentTypesVersions.createdAt))

		if (!results[0]) {
			throw new HeadbaseError({type: ErrorTypes.ENTITY_NOT_FOUND})
		}

		return results[0] as unknown as ContentTypeDto;
	}

	async queryTypes(options?: GlobalListingOptions): Promise<ContentTypeDto[]> {
		const filters: SQL[] = [
			eq(contentTypes.currentVersionId, contentTypesVersions.id)
		]
		if (typeof options?.filter?.isDeleted === 'boolean') {
			filters.push(
				eq(contentTypes.isDeleted, options?.filter.isDeleted)
			)
		}

		const order: SQL = desc(contentTypesVersions.createdAt)

		return this.drizzleDatabase
			.select({
				id: contentTypes.id,
				createdAt: contentTypes.createdAt,
				updatedAt: contentTypesVersions.createdAt,
				isDeleted: contentTypes.isDeleted,
				versionId: contentTypesVersions.id,
				previousVersionId: contentTypesVersions.previousVersionId,
				versionCreatedBy: contentTypesVersions.createdBy,
				// Custom fields
				name: contentTypesVersions.name,
				icon: contentTypesVersions.icon,
				colour: contentTypesVersions.colour,
				description: contentTypesVersions.description,
				templateName: contentTypesVersions.templateName,
				templateFields: contentTypesVersions.templateFields,
			})
			.from(contentTypes)
			.innerJoin(contentTypesVersions, eq(contentTypes.id, contentTypesVersions.entityId))
			.where(and(...filters))
			.orderBy(order) as unknown as ContentTypeDto[];
	}

	liveGet(entityId: string) {
		return new Observable<LiveQueryResult<ContentTypeDto>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.get(entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.databaseId &&
					e.detail.data.tableKey === 'content_types' &&
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
		return new Observable<LiveQueryResult<ContentTypeDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})

				try {
					const results = await this.queryTypes(options)
					subscriber.next({status: 'success', result: results})
				}
				catch(e) {
					subscriber.next({status: 'error', errors: [e]})
				}
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.databaseId &&
					e.detail.data.tableKey === 'content_types'
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
				id: contentTypesVersions.id,
				createdAt: contentTypesVersions.createdAt,
				isDeleted: contentTypesVersions.isDeleted,
				entityId: contentTypesVersions.id,
				previousVersionId: contentTypesVersions.previousVersionId,
				versionCreatedBy: contentTypesVersions.createdBy,
				// Custom fields
				name: contentTypesVersions.name,
				icon: contentTypesVersions.icon,
				colour: contentTypesVersions.colour,
				description: contentTypesVersions.description,
				templateName: contentTypesVersions.templateName,
				templateFields: contentTypesVersions.templateFields,
			})
			.from(contentTypesVersions)
			.where(eq(contentTypesVersions.id, versionId)) as unknown as ContentTypeVersionDto;
	}

	async getVersions(entityId: string) {
		return this.drizzleDatabase
			.select({
				id: contentTypesVersions.id,
				createdAt: contentTypesVersions.createdAt,
				isDeleted: contentTypesVersions.isDeleted,
				entityId: contentTypesVersions.id,
				previousVersionId: contentTypesVersions.previousVersionId,
				versionCreatedBy: contentTypesVersions.createdBy,
				// Custom fields
				name: contentTypesVersions.name,
				icon: contentTypesVersions.icon,
				colour: contentTypesVersions.colour,
				description: contentTypesVersions.description,
				templateName: contentTypesVersions.templateName,
				templateFields: contentTypesVersions.templateFields,
			})
			.from(contentTypesVersions)
			.where(eq(contentTypesVersions.entityId, entityId))
			.orderBy(desc(contentTypesVersions.createdAt)) as unknown as ContentTypeVersionDto[];
	}

	async deleteVersion(versionId: string): Promise<void> {
		const databaseId = this.getDatabaseId()

		const version = await this.drizzleDatabase
			.select({id: contentTypesVersions.id, entityId: contentTypesVersions.entityId})
			.from(contentTypesVersions)
			.where(eq(contentTypesVersions.id, versionId))
		if (!version) {
			throw new Error('Version not found')
		}

		const currentEntity = await this.drizzleDatabase
			.select({id: contentTypes.id, currentVersionId: contentTypes.currentVersionId})
			.from(contentTypes)
			.where(eq(contentTypes.id, version[0].entityId))
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
		return new Observable<LiveQueryResult<ContentTypeVersionDto[]>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const results = await this.getVersions(entityId);
				subscriber.next({status: 'success', result: results})
			}

			const handleEvent = (e: CustomEvent<DataChangeEvent['detail']>) => {
				if (
					e.detail.data.databaseId === this.databaseId &&
					e.detail.data.tableKey === 'content_types' &&
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
