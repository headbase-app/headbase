import {UserContext} from "@common/request-context.js";
import {VaultsService} from "@modules/vaults/vaults.service.js";
import {ItemsService} from "@modules/items/items.service.js";
import {ItemSnapshot, VaultSnapshot} from "@headbase-app/common";


export class SnapshotService {
	constructor(
		private readonly vaultsService: VaultsService,
		private readonly itemsService: ItemsService,
	) {}

	async getSnapshot(userContext: UserContext, vaultId: string): Promise<VaultSnapshot> {
		// Fetch the vault to ensure the user has permissions to access the given vault.
		// todo: add separate permission for fetching vault snapshot?
		const vault = await this.vaultsService.get(userContext, vaultId);

		const snapshot: VaultSnapshot = {
			vault: {
				updatedAt: vault.updatedAt
			},
			items: []
		}

		// todo: only fetch required fields not all item content
		const items = await this.itemsService._getAllItems(vaultId)
		for (const item of items) {
			const itemSnapshot: ItemSnapshot = {
				id: item.id,
				groupId: item.groupId,
				previousVersionId: item.previousVersionId,
				type: item.type,
				deletedAt: item.deletedAt
			}
			snapshot.items.push(itemSnapshot)
		}

		return snapshot
	}
}
