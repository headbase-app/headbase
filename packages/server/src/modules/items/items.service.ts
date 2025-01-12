import {ItemDto, ItemsQueryByFiltersParams} from "@headbase-app/common";
import {UserContext} from "@common/request-context.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {EventsService} from "@services/events/events.service.js";
import {EventIdentifiers} from "@services/events/events.js";
import {VaultsService} from "@modules/vaults/vaults.service.js";
import {ItemsDatabaseService} from "@modules/items/database/items.database.service.js";
import {ItemDtoWithOwner} from "@modules/items/database/database-item.js";
import {ResourceListingResult} from "@headbase-app/common";


export class ItemsService {
    constructor(
       private readonly accessControlService: AccessControlService,
       private readonly eventsService: EventsService,
       private readonly itemsDatabaseService: ItemsDatabaseService,
       private readonly vaultsService: VaultsService,
    ) {
        // todo: set up a cron job to purge deleted items
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
            userScopedPermissions: ["item:delete"],
            unscopedPermissions: ["item:delete:all"],
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

    async queryItemsById(userContext: UserContext, ids: string[]): Promise<ItemDto[]> {
        const items: ItemDto[] = []
        for (const id of ids) {
            // todo: this will run access checks on every fetch, is this ok here?
            const item = await this.getItem(userContext, id)
            items.push(item)
        }
        return items
    }

    async queryItemsByFilters(userContext: UserContext, filters: ItemsQueryByFiltersParams): Promise<ResourceListingResult<ItemDto>> {
        const vault = await this.vaultsService.get(userContext, filters.vaultId)

        // Fetching the vault has ensured the user has permissions to access the vault, but we must also check the item permissions.
        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["item:retrieve"],
            unscopedPermissions: ["item:retrieve:all"],
            requestingUserContext: userContext,
            targetUserId: vault.ownerId,
        })

        return this.itemsDatabaseService.queryItemsByFilters(filters)
    }

    async _getAllItems(vaultId: string): Promise<ItemDto[]> {
        return this.itemsDatabaseService.getAllItems(vaultId)
    }
}
