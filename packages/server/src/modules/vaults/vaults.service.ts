import {VaultsDatabaseService} from "@modules/vaults/database/vaults.database.service.js";
import {UserContext} from "@common/request-context.js";
import {CreateVaultDto, UpdateVaultDto, VaultDto} from "@headbase-app/common";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {EventsService} from "@services/events/events.service.js";
import {EventIdentifiers} from "@services/events/events.js";


export class VaultsService {
    constructor(
       private readonly vaultsDatabaseService: VaultsDatabaseService,
       private readonly accessControlService: AccessControlService,
       private readonly eventsService: EventsService
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
        
        const newVault = await this.vaultsDatabaseService.create(createVaultDto);
        await this.eventsService.dispatch({
            type: EventIdentifiers.VAULT_CREATE,
            detail: {
                sessionId: userContext.sessionId,
                vault: newVault
            }
        })

        return newVault
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
}
