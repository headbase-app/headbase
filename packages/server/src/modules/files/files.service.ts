import {ActiveVersionDto, ErrorIdentifiers, VersionDto, VersionsQueryByFiltersParams} from "@headbase-app/common";
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
import {versions, vaults} from "@services/database/schema.js";
import {and, eq, getTableColumns, inArray} from "drizzle-orm";
import {ResourceNotFoundError} from "@services/errors/resource/resource-not-found.error.js";
import {isoFormat} from "@services/database/iso-format-date.js";


export interface VersionDtoWithOwner extends ActiveVersionDto {
	ownerId: string;
}

export class FilesService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly eventsService: EventsService,
		private readonly accessControlService: AccessControlService,
		private readonly vaultsService: VaultsService,
	) {
		// todo: set up a cron job to purge deleted versions
	}

	private static getContextualError(e: any) {
		if (e instanceof Postgres.PostgresError && e.code) {
			if (e.code === PG_FOREIGN_KEY_VIOLATION) {
				if (e.constraint_name === "versions_vault") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.VAULT_NOT_FOUND,
						applicationMessage: "Attempted to add version referencing vault that doesn't exist."
					})
				}
			}
			if (e.code === PG_UNIQUE_VIOLATION) {
				if (e.constraint_name === "versions_pk") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.RESOURCE_NOT_UNIQUE,
						applicationMessage: "Version with given id already exists."
					})
				}
			}
		}

		return new SystemError({
			message: "Unexpected error while executing version query",
			originalError: e
		})
	}

	static convertDatabaseVersionToDto(versionDtoWithOwner: VersionDtoWithOwner): VersionDto {
		const { ownerId: _ownerId, ...versionDto } = versionDtoWithOwner;
		return versionDto;
	}

	async getWithOwner(userContext: UserContext, versionId: string): Promise<VersionDtoWithOwner> {
		const db = this.databaseService.getDatabase()

		let result: VersionDtoWithOwner[]
		try {
			// todo: automatic drizzle types when using joins?
			result = await db
				.select({
					...getTableColumns(versions),
					createdAt: isoFormat(versions.createdAt),
					ownerId: vaults.ownerId,
				})
				.from(versions)
				.innerJoin(vaults, eq(versions.vaultId, vaults.id))
				.where(eq(versions.id, versionId)) as unknown as VersionDtoWithOwner[]
		}
		catch (e: any) {
			throw FilesService.getContextualError(e);
		}
		if (!result[0]) {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				applicationMessage: "The requested version could not be found."
			})
		}

		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["version:retrieve"],
			unscopedPermissions: ["version:retrieve:all"],
			requestingUserContext: userContext,
			targetUserId: result[0].ownerId
		})

		return result[0]
	}

	async get(userContext: UserContext, id: string): Promise<VersionDto> {
		const version = await this.getWithOwner(userContext, id)
		return FilesService.convertDatabaseVersionToDto(version)
	}

	async create(userContext: UserContext, versionDto: VersionDto): Promise<VersionDto> {
		const vault = await this.vaultsService.get(userContext, versionDto.vaultId)
		const db = this.databaseService.getDatabase()

		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["version:create"],
			unscopedPermissions: ["version:create:all"],
			requestingUserContext: userContext,
			targetUserId: vault.ownerId,
		})

		let result: VersionDto[]
		try {
			result = await db
				.insert(versions)
				.values(versionDto)
				.returning({
					...getTableColumns(versions),
					createdAt: isoFormat(versions.createdAt),
				}) as unknown as VersionDto[]
		}
		catch (e) {
			throw FilesService.getContextualError(e);
		}
		if (!result[0]) {
			throw new SystemError({
				identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED,
				message: "Returning version after creation failed"
			})
		}

		await this.eventsService.dispatch({
			type: EventIdentifiers.VERSION_CREATE,
			detail: {
				sessionId: userContext.sessionId,
				version: versionDto
			}
		})

		return result[0]
	}

	async delete(userContext: UserContext, versionId: string): Promise<void> {
		const version = await this.getWithOwner(userContext, versionId)

		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["version:delete"],
			unscopedPermissions: ["version:delete:all"],
			requestingUserContext: userContext,
			targetUserId: version.ownerId,
		})

		const db = this.databaseService.getDatabase()
		await db
			.delete(versions)
			.where(eq(versions.id, versionId))

		await this.eventsService.dispatch({
			type: EventIdentifiers.VERSION_DELETE,
			detail: {
				sessionId: userContext.sessionId,
				vaultId: version.vaultId,
				id: versionId
			}
		})
	}

	async getFromIds(userContext: UserContext, versionIds: string[]): Promise<VersionDto[]> {
		const db = this.databaseService.getDatabase()

		let results: VersionDtoWithOwner[]
		try {
			// todo: automatic drizzle types when using joins?
			results = await db
				.select({
					...getTableColumns(versions),
					createdAt: isoFormat(versions.createdAt),
					ownerId: vaults.ownerId,
				})
				.from(versions)
				.innerJoin(vaults, eq(versions.vaultId, vaults.id))
				.where(inArray(versions.id, versionIds)) as unknown as VersionDtoWithOwner[]
		}
		catch (e: any) {
			throw FilesService.getContextualError(e);
		}

		const versionsWithoutOwner: VersionDto[] = []
		for (const result of results) {
			await this.accessControlService.validateAccessControlRules({
				userScopedPermissions: ["version:retrieve"],
				unscopedPermissions: ["version:retrieve:all"],
				requestingUserContext: userContext,
				targetUserId: result.ownerId
			})

			versionsWithoutOwner.push(FilesService.convertDatabaseVersionToDto(result))
		}
		return versionsWithoutOwner
	}

	async query(userContext: UserContext, filters: VersionsQueryByFiltersParams): Promise<ResourceListingResult<VersionDto>> {
		await this.vaultsService.get(userContext, filters.vaultId)
		const db = this.databaseService.getDatabase()

		let results: VersionDtoWithOwner[]
		try {
			// todo: automatic drizzle types when using joins?
			results = await db
				.select({
					...getTableColumns(versions),
					createdAt: isoFormat(versions.createdAt),
					ownerId: vaults.ownerId,
				})
				.from(versions)
				.innerJoin(vaults, eq(versions.vaultId, vaults.id))
				.where(and(eq(vaults.id, filters.vaultId))) as unknown as VersionDtoWithOwner[]
		}
		catch (e: any) {
			throw FilesService.getContextualError(e);
		}

		const versionsWithoutOwner: VersionDto[] = []
		for (const result of results) {
			await this.accessControlService.validateAccessControlRules({
				userScopedPermissions: ["version:retrieve"],
				unscopedPermissions: ["version:retrieve:all"],
				requestingUserContext: userContext,
				targetUserId: result.ownerId
			})

			versionsWithoutOwner.push(FilesService.convertDatabaseVersionToDto(result))
		}
		return {
			meta: {
				results: versionsWithoutOwner.length,
				total: 0,
				limit: 0,
				offset: 0
			},
			results: versionsWithoutOwner
		}
	}
}
