import {UserContext} from "@common/request-context.js";
import {VaultsService} from "@modules/vaults/vaults.service.js";
import {VersionsService} from "@modules/versions/versions.service.js";
import {VaultSnapshot} from "@headbase-app/common";


export class SnapshotService {
	constructor(
		private readonly vaultsService: VaultsService,
		private readonly versionsService: VersionsService,
	) {}

	async getSnapshot(userContext: UserContext, vaultId: string): Promise<VaultSnapshot> {
		// Fetch the vault to ensure the user has permissions to access the given vault.
		// todo: add separate permission for fetching vault snapshot?
		const vault = await this.vaultsService.get(userContext, vaultId);

		const snapshot: VaultSnapshot = {
			vault: {
				updatedAt: vault.updatedAt
			},
			versions: {}
		}

		// todo: only fetch required fields not all item content
		const versions = await this.versionsService.query(userContext, {vaultId})
		for (const version of versions.results) {
			snapshot.versions[version.id] = !!version.deletedAt
		}

		return snapshot
	}
}
