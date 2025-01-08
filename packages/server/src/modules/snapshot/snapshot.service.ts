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
				type: item.type,
				// todo: consistent use of null vs undefined?
				deletedAt: item.deletedAt || undefined,
				versions: []
			}

			// todo: only fetch required fields not all version content
			const versions = await this.itemsService._getAllVersions(item.id)
			if (versions.length) {
				// todo: is this needed?
				itemSnapshot.latestVersion = versions[0].id

				itemSnapshot.versions = versions.map((version) => {
					return {
						id: version.id,
						// todo: consistent use of null vs undefined?
						deletedAt: version.deletedAt || undefined
					}
				})
			}

			snapshot.items.push(itemSnapshot)
		}

		return snapshot
	}
}
