import {UserContext} from "@common/request-context.js";
import {VaultsService} from "@modules/vaults/vaults.service.js";
import {ItemsService} from "@modules/items/items.service.js";
import {ItemSnapshot, VaultSnapshot, VersionSnapshot} from "@headbase-app/common";


export class SnapshotService {
	constructor(
		private readonly vaultsService: VaultsService,
		private readonly itemsService: ItemsService,
	) {}

	async getSnapshot(userContext: UserContext, vaultId: string) {
		// Fetch the vault to ensure the user has permissions to access the given vault.
		// todo: add separate permission for fetching vault snapshot?
		await this.vaultsService.get(userContext, vaultId);

		const items = await this.itemsService._getAllItems(vaultId)

		const snapshot: VaultSnapshot = {
			meta: {
				items: 0,
				itemsDeleted: 0,
			},
			results: []
		}

		for (const item of items) {
			const versions = await this.itemsService._getAllVersions(item.id)

			const itemSnapshot: ItemSnapshot = {
				id: item.id,
				type: item.type,
			}

			if (item.deletedAt) {
				itemSnapshot.deletedAt = item.deletedAt
				snapshot.meta.itemsDeleted += 1
			}
			else {
				snapshot.meta.items += 1
			}


			if (versions.length) {
				itemSnapshot.latestVersion = versions[0].id
				itemSnapshot.versions = versions.map((version) => {
					const versionSnapshot: VersionSnapshot = {
						id: version.id,
					}
					if (version.deletedAt) {
						versionSnapshot.deletedAt = version.deletedAt
					}

					return versionSnapshot
				})
			}

			snapshot.results.push(itemSnapshot)
		}

		return snapshot
	}
}
