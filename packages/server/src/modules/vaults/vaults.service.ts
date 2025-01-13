import {VaultsDatabaseService} from "@modules/vaults/database/vaults.database.service.js";
import {UserContext} from "@common/request-context.js";
import {CreateVaultDto, ErrorIdentifiers, UpdateVaultDto, VaultDto, VaultsQueryParams} from "@headbase-app/common";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {EventsService} from "@services/events/events.service.js";
import {EventIdentifiers} from "@services/events/events.js";
import {DatabaseService} from "@services/database/database.service.js";
import {vaults} from "@services/database/schema.js";
import {inArray} from "drizzle-orm";
import {SystemError} from "@services/errors/base/system.error.js";


export class VaultsService {
    constructor(
       private readonly vaultsDatabaseService: VaultsDatabaseService,
       private readonly accessControlService: AccessControlService,
       private readonly eventsService: EventsService,
       private readonly databaseService: DatabaseService
    ) {}

    async get(userContext: UserContext, vaultId: string) {
        const vault = await this.vaultsDatabaseService.get(vaultId);

        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["vaults:retrieve"],
            unscopedPermissions: ["vaults:retrieve:all"],
            requestingUserContext: userContext,
            targetUserId: vault.ownerId
        })
        
        return vault
    }

    async create(userContext: UserContext, createVaultDto: CreateVaultDto): Promise<VaultDto> {
        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["vaults:create"],
            unscopedPermissions: ["vaults:create:all"],
            requestingUserContext: userContext,
            targetUserId: createVaultDto.ownerId
        })

        const db = this.databaseService.getDatabase()
        const result = await db
          .insert(vaults)
          .values(createVaultDto)
          .returning()

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
        const vault = await this.vaultsDatabaseService.get(vaultId);

        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["vaults:update"],
            unscopedPermissions: ["vaults:update:all"],
            requestingUserContext: userContext,
            targetUserId: vault.ownerId
        })
        
        const updatedVault = await this.vaultsDatabaseService.update(vaultId, updateVaultDto);
        await this.eventsService.dispatch({
            type: EventIdentifiers.VAULT_UPDATE,
            detail: {
                sessionId: userContext.sessionId,
                vault: updatedVault
            }
        })

        return updatedVault
    }

    async delete(userContext: UserContext, vaultId: string): Promise<void> {
        const vault = await this.vaultsDatabaseService.get(vaultId);

        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["vaults:delete"],
            unscopedPermissions: ["vaults:delete:all"],
            requestingUserContext: userContext,
            targetUserId: vault.ownerId
        })

        await this.vaultsDatabaseService.delete(vaultId);
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
}
