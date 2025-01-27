import {ActiveItemDto, ErrorIdentifiers, ItemDto, ItemsQueryByFiltersParams} from "@headbase-app/common";
import {UserContext} from "@common/request-context.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {EventsService} from "@services/events/events.service.js";
import {EventIdentifiers} from "@services/events/events.js";
import {VaultsService} from "@modules/vaults/vaults.service.js";
import {ResourceListingResult} from "@headbase-app/common";
import {DatabaseService} from "@services/database/database.service.js";
import Postgres from "postgres";
import {PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION} from "@services/database/database-error-codes.js";
import {ResourceRelationshipError} from "@services/errors/resource/resource-relationship.error.js";
import {SystemError} from "@services/errors/base/system.error.js";
import {items, vaults} from "@services/database/schema.js";
import {and, eq, inArray} from "drizzle-orm";
import {ResourceNotFoundError} from "@services/errors/resource/resource-not-found.error.js";


export interface ItemDtoWithOwner extends ActiveItemDto {
	ownerId: string;
}

export class ItemsService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly eventsService: EventsService,
		private readonly accessControlService: AccessControlService,
		private readonly vaultsService: VaultsService,
	) {
		// todo: set up a cron job to purge deleted items
	}

	private static getContextualError(e: any) {
		if (e instanceof Postgres.PostgresError && e.code) {
			if (e.code === PG_FOREIGN_KEY_VIOLATION) {
				if (e.constraint_name === "items_vault") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.VAULT_NOT_FOUND,
						applicationMessage: "Attempted to add item referencing vault that doesn't exist."
					})
				}
			}
			if (e.code === PG_UNIQUE_VIOLATION) {
				if (e.constraint_name === "items_pk") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.RESOURCE_NOT_UNIQUE,
						applicationMessage: "Item with given id already exists."
					})
				}
			}
		}

		return new SystemError({
			message: "Unexpected error while executing item query",
			originalError: e
		})
	}

	static convertDatabaseItemToDto(itemDtoWithOwner: ItemDtoWithOwner): ItemDto {
		const { ownerId: _ownerId, ...itemDto } = itemDtoWithOwner;
		return itemDto;
	}

	async getWithOwner(userContext: UserContext, itemId: string): Promise<ItemDtoWithOwner> {
		const db = this.databaseService.getDatabase()

		let result: ItemDtoWithOwner[]
		try {
			// todo: automatic drizzle types when using joins?
			result = await db
				.select()
				.from(items)
				.innerJoin(vaults, eq(items.vaultId, vaults.id))
				.where(eq(items.id, itemId)) as unknown as ItemDtoWithOwner[]
		}
		catch (e: any) {
			throw ItemsService.getContextualError(e);
		}
		if (!result[0]) {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				applicationMessage: "The requested item could not be found."
			})
		}

		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["item:retrieve"],
			unscopedPermissions: ["item:retrieve:all"],
			requestingUserContext: userContext,
			targetUserId: result[0].ownerId
		})

		return result[0]
	}

	async get(userContext: UserContext, itemId: string): Promise<ItemDto> {
		const item = await this.getWithOwner(userContext, itemId)
		return ItemsService.convertDatabaseItemToDto(item)
	}

	async create(userContext: UserContext, itemDto: ItemDto): Promise<ItemDto> {
		const vault = await this.vaultsService.get(userContext, itemDto.vaultId)
		const db = this.databaseService.getDatabase()

		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["item:create"],
			unscopedPermissions: ["item:create:all"],
			requestingUserContext: userContext,
			targetUserId: vault.ownerId,
		})

		let result: ItemDto[]
		try {
			result = await db
				.insert(items)
				.values(itemDto)
				.returning() as unknown as ItemDto[]
		}
		catch (e) {
			throw ItemsService.getContextualError(e);
		}
		if (!result[0]) {
			throw new SystemError({
				identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED,
				message: "Returning item after creation failed"
			})
		}

		await this.eventsService.dispatch({
			type: EventIdentifiers.ITEM_CREATE,
			detail: {
				sessionId: userContext.sessionId,
				item: itemDto
			}
		})

		return result[0]
	}

	async delete(userContext: UserContext, itemId: string): Promise<void> {
		const item = await this.getWithOwner(userContext, itemId)

		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["item:delete"],
			unscopedPermissions: ["item:delete:all"],
			requestingUserContext: userContext,
			targetUserId: item.ownerId,
		})

		const db = this.databaseService.getDatabase()
		await db
			.delete(items)
			.where(eq(items.id, itemId))

		await this.eventsService.dispatch({
			type: EventIdentifiers.ITEM_DELETE,
			detail: {
				sessionId: userContext.sessionId,
				vaultId: item.vaultId,
				itemId: itemId
			}
		})
	}

	async getFromIds(userContext: UserContext, itemIds: string[]): Promise<ItemDto[]> {
		const db = this.databaseService.getDatabase()

		let results: ItemDtoWithOwner[]
		try {
			// todo: automatic drizzle types when using joins?
			results = await db
				.select()
				.from(items)
				.innerJoin(vaults, eq(items.vaultId, vaults.id))
				.where(inArray(items.id, itemIds)) as unknown as ItemDtoWithOwner[]
		}
		catch (e: any) {
			throw ItemsService.getContextualError(e);
		}

		const itemsWithoutOwner: ItemDto[] = []
		for (const result of results) {
			await this.accessControlService.validateAccessControlRules({
				userScopedPermissions: ["item:retrieve"],
				unscopedPermissions: ["item:retrieve:all"],
				requestingUserContext: userContext,
				targetUserId: result.ownerId
			})

			itemsWithoutOwner.push(ItemsService.convertDatabaseItemToDto(result))
		}
		return itemsWithoutOwner
	}

	async query(userContext: UserContext, filters: ItemsQueryByFiltersParams): Promise<ResourceListingResult<ItemDto>> {
		await this.vaultsService.get(userContext, filters.vaultId)
		const db = this.databaseService.getDatabase()

		let results: ItemDtoWithOwner[]
		try {
			// todo: automatic drizzle types when using joins?
			results = await db
				.select()
				.from(items)
				.innerJoin(vaults, eq(items.vaultId, vaults.id))
				.where(and(eq(vaults.id, filters.vaultId))) as unknown as ItemDtoWithOwner[]
		}
		catch (e: any) {
			throw ItemsService.getContextualError(e);
		}

		const itemsWithoutOwner: ItemDto[] = []
		for (const result of results) {
			await this.accessControlService.validateAccessControlRules({
				userScopedPermissions: ["item:retrieve"],
				unscopedPermissions: ["item:retrieve:all"],
				requestingUserContext: userContext,
				targetUserId: result.ownerId
			})

			itemsWithoutOwner.push(ItemsService.convertDatabaseItemToDto(result))
		}
		return {
			meta: {
				results: itemsWithoutOwner.length,
				total: 0,
				limit: 0,
				offset: 0
			},
			results: itemsWithoutOwner
		}
	}
}
