import {DatabaseService} from "@services/database/database.service.js";
import {
	ErrorIdentifiers,
	ItemDto,
	ItemsQueryByFiltersParams,
	ResourceListingResult,
	VersionDto, VersionsQueryByFiltersParams
} from "@headbase-app/common";
import Postgres from "postgres";
import {PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION} from "@services/database/database-error-codes.js";
import {ResourceRelationshipError} from "@services/errors/resource/resource-relationship.error.js";
import {SystemError} from "@services/errors/base/system.error.js";
import {ResourceNotFoundError} from "@services/errors/resource/resource-not-found.error.js";
import {
	ItemDtoWithOwner,
	VersionDtoWithOwner,
} from "@modules/items/database/database-item.js";
import {EnvironmentService} from "@services/environment/environment.service.js";
import {UserRequestError} from "@services/errors/base/user-request.error.js";


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
				if (e.constraint_name === "item_versions_item") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND, // todo: add unique item/version identifiers
						applicationMessage: "Attempted to add version referencing item that doesn't exist."
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
				if (e.constraint_name === "item_versions_pk") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.RESOURCE_NOT_UNIQUE,
						applicationMessage: "Item version with given id already exists."
					})
				}
			}
		}

		return new SystemError({
			message: "Unexpected error while executing item/version query",
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

			// Delete all versions as they aren't needed anymore.
			await sql`delete from item_versions where item_id = ${itemId}`;
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

	async getItemsByFilters(filters: ItemsQueryByFiltersParams): Promise<ResourceListingResult<ItemDto>> {
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

	async getVersion(versionId: string): Promise<VersionDtoWithOwner> {
		const sql = await this.databaseService.getSQL();

		let result: VersionDtoWithOwner[] = [];
		try {
			result = await sql<VersionDtoWithOwner[]>`
				select item_versions.*, vaults.owner_id from item_versions
				join items on item_versions.item_id = item_versions.item_id
				join vaults on items.vault_id = vaults.id
				where item_versions.id = ${versionId}
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
				applicationMessage: "The requested version could not be found."
			})
		}
	}

	async createVersion(itemVersionDto: VersionDto): Promise<VersionDto> {
		const sql = await this.databaseService.getSQL();

		let result: VersionDtoWithOwner[] = [];
		try {
			result = await sql<VersionDtoWithOwner[]>`insert into item_versions ${sql([itemVersionDto])} returning *;`;
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

	async deleteVersion(versionId: string): Promise<void> {
		const sql = await this.databaseService.getSQL();

		let deleteResult: Postgres.RowList<Postgres.Row[]>;
		try {
			deleteResult = await sql`
          update item_versions
          set (deleted_at, protected_data) = (now(), null)
          where id = ${versionId}
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
				applicationMessage: "The requested version could not be found."
			})
		}
	}

	async purgeVersion(versionId: string): Promise<void> {
		const sql = await this.databaseService.getSQL();

		let result: Postgres.RowList<Postgres.Row[]>;
		try {
			result = await sql`delete from item_versions where id = ${versionId}`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		// If there's a count then rows were affected and the deletion was a success
		// If there's no count but an error wasn't thrown then the entity must not exist
		if (result?.count) {
			return;
		}
		else {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				applicationMessage: "The requested version could not be found."
			})
		}
	}

	async getAllVersions(itemId: string): Promise<VersionDto[]> {
		const sql = await this.databaseService.getSQL();

		let versions: VersionDto[] = [];
		try {
			versions = await sql<VersionDto[]>`select * from item_versions where item_id = ${itemId} order by created_at desc`;
		}
		catch (e: any) {
			throw ItemsDatabaseService.getDatabaseError(e);
		}

		return versions
	}

	async getVersionsByFilters(filters: VersionsQueryByFiltersParams): Promise<ResourceListingResult<VersionDto>> {
		const sql = await this.databaseService.getSQL();

		const offset = filters.offset || 0
		const limit = filters.limit
			? Math.min(filters.limit, this.environmentService.vars.versions.maxPageLimit)
			: this.environmentService.vars.versions.defaultPageLimit

		let results: VersionDto[] = [];
		let totalCount: number = 0
		try {
			const where = sql`
				where item_id in ${sql(filters.itemId)}
				${filters.deviceName
					? sql`and device_name in ${sql(filters.deviceName)}`
					: sql``
				}
				${filters.notDeviceName
					? sql`and device_name not in ${sql(filters.notDeviceName)}`
					: sql``
				}
			`;
			const paging = sql`order by created_at offset ${offset} limit ${limit}`

			results = await sql<VersionDto[]>`select * from item_versions ${where} ${paging}`;

			const countResult = await sql<{count: number}[]>`select count(*) from item_versions ${where}`
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
}
