import {DatabaseService} from "@services/database/database.service.js";
import {
	ErrorIdentifiers,
	ItemDto,
	ItemsQueryByFiltersParams,
	ResourceListingResult
} from "@headbase-app/common";
import Postgres from "postgres";
import {PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION} from "@services/database/database-error-codes.js";
import {ResourceRelationshipError} from "@services/errors/resource/resource-relationship.error.js";
import {SystemError} from "@services/errors/base/system.error.js";
import {ResourceNotFoundError} from "@services/errors/resource/resource-not-found.error.js";
import {
	ItemDtoWithOwner
} from "@modules/items/database/database-item.js";
import {EnvironmentService} from "@services/environment/environment.service.js";


export class ItemsDatabaseService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly environmentService: EnvironmentService
	) {}

	private static getDatabaseError(e: any) {
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

	async getItem(itemId: string): Promise<ItemDtoWithOwner> {
		const sql = await this.databaseService.getSQL();

		let result: ItemDtoWithOwner[] = [];
		try {
			result = await sql<ItemDtoWithOwner[]>`
				select items.*, vaults.owner_id from items
				join vaults on items.vault_id = vaults.id
				where items.id = ${itemId}
			`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		if (result.length === 1) {
			return result[0]
		}
		else {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				applicationMessage: "The requested item could not be found."
			})
		}
	}

	async createItem(itemDto: ItemDto): Promise<ItemDto> {
		const sql = await this.databaseService.getSQL();

		let result: ItemDtoWithOwner[] = [];
		try {
			result = await sql<ItemDtoWithOwner[]>`insert into items ${sql([itemDto])} returning *;`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		if (result.length === 1) {
			return result[0]
		}
		else {
			throw new SystemError({
				message: "Unexpected error returning item after creation",
			})
		}
	}

	async deleteItem(itemId: string): Promise<void> {
		const sql = await this.databaseService.getSQL();

		let deleteResult: Postgres.RowList<Postgres.Row[]>;
		try {
			deleteResult = await sql`
          update vaults
          set deleted_at = now()
          where id = ${itemId}
          returning *;
			`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		// If there's a count then rows were affected and the deletion was a success
		// If there's no count but an error wasn't thrown then the entity must not exist
		if (deleteResult && deleteResult.count) {
			return;
		}
		else {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				applicationMessage: "The requested item could not be found."
			})
		}
	}

	async purgeItem(itemId: string): Promise<void> {
		const sql = await this.databaseService.getSQL();

		let result: Postgres.RowList<Postgres.Row[]>;
		try {
			result = await sql`DELETE FROM items WHERE id = ${itemId}`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		// If there's a count then rows were affected and the deletion was a success
		// If there's no count but an error wasn't thrown then the entity must not exist
		if (result && result.count) {
			return;
		}
		else {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				applicationMessage: "The requested item could not be found."
			})
		}
	}

	async queryItemsByFilters(filters: ItemsQueryByFiltersParams): Promise<ResourceListingResult<ItemDto>> {
		const sql = await this.databaseService.getSQL();

		const offset = filters.offset || 0
		const limit = filters.limit
			? Math.min(filters.limit, this.environmentService.vars.items.maxPageLimit)
			: this.environmentService.vars.items.defaultPageLimit

		let results: ItemDto[] = [];
		let totalCount: number = 0
		try {
			const where = sql`
				where vault_id = ${filters.vaultId}
				${filters.types
					? sql`and item_type in ${sql(filters.types)}`
					: sql``
				}
			`;
			const paging = sql`order by created_at offset ${offset} limit ${limit}`

			results = await sql<ItemDto[]>`select * from items ${where} ${paging}`;

			const countResult = await sql<{count: number}[]>`select count(*) from items ${where}`
			if (countResult[0]?.count) {
				totalCount = parseInt(String(countResult[0].count))
			}
			else {
				throw new SystemError({message: "Failed to fetch query count"})
			}
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		return {
			meta: {
				results: results.length,
				total: totalCount,
				limit,
				offset,
			},
			results
		}
	}

	async getAllItems(vaultId: string): Promise<ItemDto[]> {
		const sql = await this.databaseService.getSQL();

		let items: ItemDto[] = [];
		try {
			items = await sql<ItemDto[]>`select * from items where vault_id = ${vaultId} order by created_at desc`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		return items
	}
}
