import {UserContext} from "@common/request-context.js";
import {CreateVaultDto, ErrorIdentifiers, UpdateVaultDto, VaultDto, VaultsQueryParams} from "@headbase-app/common";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {EventsService} from "@services/events/events.service.js";
import {EventIdentifiers} from "@services/events/events.js";
import {DatabaseService} from "@services/database/database.service.js";
import {vaults} from "@services/database/schema.js";
import {eq, inArray} from "drizzle-orm";
import {SystemError} from "@services/errors/base/system.error.js";
import {ResourceRelationshipError} from "@services/errors/resource/resource-relationship.error.js";
import {PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION} from "@services/database/database-error-codes.js";
import Postgres from "postgres";
import {ResourceNotFoundError} from "@services/errors/resource/resource-not-found.error.js";


export class VaultsService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly eventsService: EventsService,
		private readonly accessControlService: AccessControlService,
	) {}

	async get(userContext: UserContext, vaultId: string) {
		const db = this.databaseService.getDatabase()

		let result: VaultDto[];
		try {
			result = await db
				.select()
				.from(vaults)
				.where(eq(vaults.id, vaultId))
		}
		catch (e) {
			throw VaultsService.getContextualError(e)
		}
		if (!result[0]) {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.VAULT_NOT_FOUND,
				applicationMessage: "The requested vault could not be found."
			})
		}

		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["vaults:retrieve"],
			unscopedPermissions: ["vaults:retrieve:all"],
			requestingUserContext: userContext,
			targetUserId: result[0].ownerId
		})

		return result[0]
	}

	async create(userContext: UserContext, createVaultDto: CreateVaultDto): Promise<VaultDto> {
		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["vaults:create"],
			unscopedPermissions: ["vaults:create:all"],
			requestingUserContext: userContext,
			targetUserId: createVaultDto.ownerId
		})

		const db = this.databaseService.getDatabase()

		let result: VaultDto[];
		try {
			result = await db
				.insert(vaults)
				.values(createVaultDto)
				.returning()
		}
		catch (e) {
			throw VaultsService.getContextualError(e)
		}
		if (!result[0]) {
			throw new SystemError({identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED, message: "Returning vault after creation failed"});
		}

		await this.eventsService.dispatch({
			type: EventIdentifiers.VAULT_CREATE,
			detail: {
				sessionId: userContext.sessionId,
				vault: result[0],
			}
		})

		return result[0]
	}

	async update(userContext: UserContext, vaultId: string, updateVaultDto: UpdateVaultDto): Promise<VaultDto> {
		const vault = await this.get(userContext, vaultId);

		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["vaults:update"],
			unscopedPermissions: ["vaults:update:all"],
			requestingUserContext: userContext,
			targetUserId: vault.ownerId
		})

		const db = this.databaseService.getDatabase()

		let result: VaultDto[];
		try {
			result = await db
				.update(vaults)
				.set(updateVaultDto)
				.where(eq(vaults.id, vaultId))
				.returning()
		}
		catch (e) {
			throw VaultsService.getContextualError(e)
		}
		if (!result[0]) {
			throw new SystemError({identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED, message: "Returning vault after update failed"});
		}

		await this.eventsService.dispatch({
			type: EventIdentifiers.VAULT_UPDATE,
			detail: {
				sessionId: userContext.sessionId,
				vault: result[0]
			}
		})

		return result[0]
	}

	async delete(userContext: UserContext, vaultId: string): Promise<void> {
		const vault = await this.get(userContext, vaultId);

		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["vaults:delete"],
			unscopedPermissions: ["vaults:delete:all"],
			requestingUserContext: userContext,
			targetUserId: vault.ownerId
		})

		const db = this.databaseService.getDatabase()
		await db
			.delete(vaults)
			.where(eq(vaults.id, vaultId))

		await this.eventsService.dispatch({
			type: EventIdentifiers.VAULT_DELETE,
			detail: {
				sessionId: userContext.sessionId,
				vaultId: vaultId,
				ownerId: vault.ownerId
			}
		})
	}

	async queryVaults(userContext: UserContext, query: VaultsQueryParams) {
		const ownerIds = query.ownerIds || [userContext.id]

		for (const ownerId of ownerIds) {
			await this.accessControlService.validateAccessControlRules({
				userScopedPermissions: ["vaults:retrieve"],
				unscopedPermissions: ["vaults:retrieve:all"],
				requestingUserContext: userContext,
				targetUserId: ownerId
			})
		}

		const db = this.databaseService.getDatabase()

		return db
			.select()
			.from(vaults)
			.where(inArray(vaults.ownerId, ownerIds))
			.orderBy(vaults.updatedAt)
	}

	private static getContextualError(e: any) {
		if (e instanceof Postgres.PostgresError && e.code) {
			if (e.code === PG_FOREIGN_KEY_VIOLATION) {
				if (e.constraint_name === "vault_owner") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.USER_NOT_FOUND,
						applicationMessage: "Attempted to add a vault with owner that doesn't exist."
					})
				}
			}
			if (e.code === PG_UNIQUE_VIOLATION) {
				if (e.constraint_name === "vault_name_unique") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.VAULT_NAME_EXISTS,
						applicationMessage: "Vault owner already has vault with the given name."
					})
				}
				else if (e.constraint_name === "vaults_pk") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.RESOURCE_NOT_UNIQUE,
						applicationMessage: "Vault with given id already exists."
					})
				}
			}
		}

		return new SystemError({
			message: "Unexpected error while executing vault query",
			originalError: e
		})
	}
}
