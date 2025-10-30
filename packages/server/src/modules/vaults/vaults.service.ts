import { forwardRef, Inject, Injectable } from "@nestjs/common";
import postgres from "postgres";
import { DrizzleQueryError, eq, getTableColumns, inArray } from "drizzle-orm";
import { ErrorIdentifiers, UpdateVaultDto, VaultDto, VaultsQueryParams } from "@headbase-app/contracts";

import { UserContext } from "@common/request-context";
import { AccessControlService } from "@modules/auth/access-control.service";
import { EventsService } from "@services/events/events.service";
import { EventIdentifiers } from "@services/events/events";
import { DatabaseService } from "@services/database/database.service";
import { vaults } from "@services/database/schema/schema";
import { SystemError } from "@services/errors/base/system.error";
import { ResourceRelationshipError } from "@services/errors/resource/resource-relationship.error";
import { PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION } from "@services/database/database-error-codes";
import { ResourceNotFoundError } from "@services/errors/resource/resource-not-found.error";
import { isoFormat } from "@services/database/schema/iso-format-date";
import { ChunksService } from "@modules/chunks/chunks.service";

@Injectable()
export class VaultsService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly eventsService: EventsService,
		private readonly accessControlService: AccessControlService,
		@Inject(forwardRef(() => ChunksService))
		private readonly chunksService: ChunksService,
	) {}

	private static getContextualError(e: any) {
		if (e instanceof DrizzleQueryError && e.cause instanceof postgres.PostgresError) {
			if (e.cause.code === PG_FOREIGN_KEY_VIOLATION) {
				if (e.cause.constraint_name === "vault_owner") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.USER_NOT_FOUND,
						userMessage: "Attempted to add a vault with owner that doesn't exist.",
					});
				}
			}
			if (e.cause.code === PG_UNIQUE_VIOLATION) {
				if (e.cause.constraint_name === "vault_name_unique") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.VAULT_NAME_EXISTS,
						userMessage: "Vault owner already has vault with the given name.",
					});
				} else if (e.cause.constraint_name === "vaults_pk") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.RESOURCE_NOT_UNIQUE,
						userMessage: "Vault with given id already exists.",
					});
				}
			}
		}

		return new SystemError({
			message: "Unexpected error while executing vault query",
			cause: e,
		});
	}

	async get(userContext: UserContext, vaultId: string) {
		const db = this.databaseService.getDatabase();

		let result: VaultDto[];
		try {
			result = await db
				.select({
					...getTableColumns(vaults),
					createdAt: isoFormat(vaults.createdAt),
					updatedAt: isoFormat(vaults.updatedAt),
				})
				.from(vaults)
				.where(eq(vaults.id, vaultId));
		} catch (e) {
			throw VaultsService.getContextualError(e);
		}
		if (!result[0]) {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.VAULT_NOT_FOUND,
				userMessage: "The requested vault could not be found.",
			});
		}

		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["vaults:retrieve"],
			unscopedPermissions: ["vaults:retrieve:all"],
			requestingUserContext: userContext,
			targetUserId: result[0].ownerId,
		});

		return result[0];
	}

	/**
	 * Add a vault which was created on a local device to the server.
	 * Vaults are created on a local device before being pushed to the server, so there is no separate "CreateVaultDto" here.
	 *
	 * // todo: use separate verbs like "push" and "sync" rather than "create" and "update" to distinguish resources managed by the server vs local devices?
	 */
	async create(userContext: UserContext, vaultDto: VaultDto): Promise<VaultDto> {
		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["vaults:create"],
			unscopedPermissions: ["vaults:create:all"],
			requestingUserContext: userContext,
			targetUserId: vaultDto.ownerId,
		});

		const db = this.databaseService.getDatabase();

		let result: VaultDto[];
		try {
			result = await db
				.insert(vaults)
				.values(vaultDto)
				.returning({
					...getTableColumns(vaults),
					createdAt: isoFormat(vaults.createdAt),
					updatedAt: isoFormat(vaults.updatedAt),
				});
		} catch (e) {
			throw VaultsService.getContextualError(e);
		}
		if (!result[0]) {
			throw new SystemError({ identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED, message: "Returning vault after creation failed" });
		}

		this.eventsService.dispatch({
			type: EventIdentifiers.VAULT_CREATE,
			detail: {
				sessionId: userContext.sessionId,
				vault: result[0],
			},
		});

		return result[0];
	}

	async update(userContext: UserContext, vaultId: string, updateVaultDto: UpdateVaultDto): Promise<VaultDto> {
		const vault = await this.get(userContext, vaultId);

		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["vaults:update"],
			unscopedPermissions: ["vaults:update:all"],
			requestingUserContext: userContext,
			targetUserId: vault.ownerId,
		});

		const db = this.databaseService.getDatabase();

		let result: VaultDto[];
		try {
			result = await db
				.update(vaults)
				.set(updateVaultDto)
				.where(eq(vaults.id, vaultId))
				.returning({
					...getTableColumns(vaults),
					createdAt: isoFormat(vaults.createdAt),
					updatedAt: isoFormat(vaults.updatedAt),
				});
		} catch (e) {
			throw VaultsService.getContextualError(e);
		}
		if (!result[0]) {
			throw new SystemError({ identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED, message: "Returning vault after update failed" });
		}

		this.eventsService.dispatch({
			type: EventIdentifiers.VAULT_UPDATE,
			detail: {
				sessionId: userContext.sessionId,
				vault: result[0],
			},
		});

		return result[0];
	}

	async delete(userContext: UserContext, vaultId: string): Promise<void> {
		const vault = await this.get(userContext, vaultId);

		await this.accessControlService.validateAccessControlRules({
			userScopedPermissions: ["vaults:delete"],
			unscopedPermissions: ["vaults:delete:all"],
			requestingUserContext: userContext,
			targetUserId: vault.ownerId,
		});

		const db = this.databaseService.getDatabase();
		await db.delete(vaults).where(eq(vaults.id, vaultId));

		this.eventsService.dispatch({
			type: EventIdentifiers.VAULT_DELETE,
			detail: {
				sessionId: userContext.sessionId,
				vaultId: vaultId,
				ownerId: vault.ownerId,
			},
		});
	}

	async query(userContext: UserContext, query: VaultsQueryParams) {
		const ownerIds = query.ownerIds || [userContext.id];

		for (const ownerId of ownerIds) {
			await this.accessControlService.validateAccessControlRules({
				userScopedPermissions: ["vaults:retrieve"],
				unscopedPermissions: ["vaults:retrieve:all"],
				requestingUserContext: userContext,
				targetUserId: ownerId,
			});
		}

		const db = this.databaseService.getDatabase();

		return db
			.select({
				...getTableColumns(vaults),
				createdAt: isoFormat(vaults.createdAt),
				updatedAt: isoFormat(vaults.updatedAt),
			})
			.from(vaults)
			.where(inArray(vaults.ownerId, ownerIds))
			.orderBy(vaults.updatedAt);
	}

	async getChunks(userContext: UserContext, vaultId: string) {
		// Using get method to run authentication checks
		await this.get(userContext, vaultId);

		return this.chunksService.getAllVaultChunks(vaultId);
	}
}
