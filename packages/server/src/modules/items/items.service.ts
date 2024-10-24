import {ItemDto, ItemsQueryByFiltersParams, VersionDto, VersionsQueryByFiltersParams} from "@headbase-app/common";
import {UserContext} from "@common/request-context.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {EventsService} from "@services/events/events.service.js";
import {EventIdentifiers} from "@services/events/events.js";
import {VaultsService} from "@modules/vaults/vaults.service.js";
import {ItemsDatabaseService} from "@modules/items/database/items.database.service.js";
import {ItemDtoWithOwner, VersionDtoWithOwner} from "@modules/items/database/database-item.js";
import {ResourceListingResult} from "@headbase-app/common";


export class ItemsService {
    constructor(
       private readonly accessControlService: AccessControlService,
       private readonly eventsService: EventsService,
       private readonly itemsDatabaseService: ItemsDatabaseService,
       private readonly vaultsService: VaultsService,
    ) {
        // todo: set up a cron job to purge deleted items and versions
    }

    convertDatabaseItemDto(itemDtoWithOwner: ItemDtoWithOwner): ItemDto {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ownerId, ...itemDto } = itemDtoWithOwner;
        return itemDto;
    }

    async getItem(userContext: UserContext, itemId: string): Promise<ItemDto> {
        const itemDtoWithOwner = await this._getItemWithOwner(userContext, itemId);

        return this.convertDatabaseItemDto(itemDtoWithOwner)
    }

    async _getItemWithOwner(userContext: UserContext, itemId: string): Promise<ItemDtoWithOwner> {
        const itemDtoWithOwner = await this.itemsDatabaseService.getItem(itemId)

        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["item:retrieve"],
            unscopedPermissions: ["item:retrieve:all"],
            requestingUserContext: userContext,
            targetUserId: itemDtoWithOwner.ownerId
        })

        return itemDtoWithOwner
    }

    async createItem(userContext: UserContext, itemDto: ItemDto): Promise<ItemDto> {
        const vault = await this.vaultsService.get(userContext, itemDto.vaultId)

        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["item:create"],
            unscopedPermissions: ["item:create:all"],
            requestingUserContext: userContext,
            targetUserId: vault.ownerId,
        })

        const createdItem = await this.itemsDatabaseService.createItem(itemDto)
        await this.eventsService.dispatch({
            type: EventIdentifiers.ITEM_CREATE,
            detail: {
                sessionId: userContext.sessionId,
                item: itemDto
            }
        })

        return createdItem
    }

    async deleteItem(userContext: UserContext, itemId: string): Promise<void> {
        const item = await this._getItemWithOwner(userContext, itemId)

        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["item-version:delete"],
            unscopedPermissions: ["item-version:delete:all"],
            requestingUserContext: userContext,
            targetUserId: item.ownerId,
        })

        await this.itemsDatabaseService.deleteItem(itemId);
        await this.eventsService.dispatch({
            type: EventIdentifiers.ITEM_DELETE,
            detail: {
                sessionId: userContext.sessionId,
                vaultId: item.vaultId,
                itemId: itemId
            }
        })
    }

    async getItemsById(userContext: UserContext, ids: string[]): Promise<ItemDto[]> {
        const items: ItemDto[] = []
        for (const id of ids) {
            // todo: this will run access checks on every fetch, is this ok here?
            const item = await this.getItem(userContext, id)
            items.push(item)
        }
        return items
    }

    async getItemsByFilters(userContext: UserContext, filters: ItemsQueryByFiltersParams): Promise<ResourceListingResult<ItemDto>> {
        const vault = await this.vaultsService.get(userContext, filters.vaultId)

        // Fetching the vault has ensured the user has permissions to access the vault, but we must also check the item permissions.
        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["item:retrieve"],
            unscopedPermissions: ["item:retrieve:all"],
            requestingUserContext: userContext,
            targetUserId: vault.ownerId,
        })

        return this.itemsDatabaseService.getItemsByFilters(filters)
    }

    async _getAllItems(vaultId: string): Promise<ItemDto[]> {
        return this.itemsDatabaseService.getAllItems(vaultId)
    }

    convertDatabaseItemVersionDto(itemVersionDtoWithOwner: VersionDtoWithOwner): VersionDto {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ownerId, ...itemVersionDto } = itemVersionDtoWithOwner;
        return itemVersionDto;
    }

    async getVersion(userContext: UserContext, versionId: string) {
        const versionDtoWithOwner = await this._getVersionWithOwner(userContext, versionId);

        return this.convertDatabaseItemVersionDto(versionDtoWithOwner)
    }

    async _getVersionWithOwner(userContext: UserContext, versionId: string) {
        const versionDtoWithOwner = await this.itemsDatabaseService.getVersion(versionId)

        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["item-version:retrieve"],
            unscopedPermissions: ["item-version:retrieve:all"],
            requestingUserContext: userContext,
            targetUserId: versionDtoWithOwner.ownerId
        })

        return versionDtoWithOwner
    }

    async createVersion(userContext: UserContext, versionDto: VersionDto) {
        const itemDto = await this._getItemWithOwner(userContext, versionDto.itemId)

        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["item-version:create"],
            unscopedPermissions: ["item-version:create:all"],
            requestingUserContext: userContext,
            targetUserId: itemDto.ownerId,
        })

        const createdVersion = await this.itemsDatabaseService.createVersion(versionDto)
        await this.eventsService.dispatch({
            type: EventIdentifiers.ITEM_VERSION_CREATE,
            detail: {
                sessionId: userContext.sessionId,
                version: versionDto
            }
        })

        return createdVersion
    }

    async deleteVersion(userContext: UserContext, versionId: string) {
        const versionDto = await this._getVersionWithOwner(userContext, versionId)

        // todo: maybe refactor version fetching to also include vaultId?
        const itemDto = await this.getItem(userContext, versionId)

        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["item-version:delete"],
            unscopedPermissions: ["item-version:delete:all"],
            requestingUserContext: userContext,
            targetUserId: versionDto.ownerId,
        })

        await this.itemsDatabaseService.deleteVersion(versionId);
        await this.eventsService.dispatch({
            type: EventIdentifiers.ITEM_VERSION_DELETE,
            detail: {
                sessionId: userContext.sessionId,
                vaultId: itemDto.vaultId,
                versionId: versionId
            }
        })
    }

    async getVersionsById(userContext: UserContext, ids: string[]): Promise<VersionDto[]> {
        const versions: VersionDto[] = []
        for (const id of ids) {
            const version = await this.getVersion(userContext, id)
            versions.push(version)
        }
        return versions
    }

    async getVersionsByFilters(userContext: UserContext, filters: VersionsQueryByFiltersParams): Promise<ResourceListingResult<VersionDto>> {
        // Fetch all items to ensure the user has permissions to access these items, and ensure they all exist.
        await this.getItemsById(userContext, filters.itemId)
        return this.itemsDatabaseService.getVersionsByFilters(filters)
    }

    async _getAllVersions(itemId: string): Promise<VersionDto[]> {
        return this.itemsDatabaseService.getAllVersions(itemId)
    }
}
