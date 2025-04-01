import {DeviceContext, IDatabaseService} from "../../interfaces.ts";
import {EntityTransactionsConfig} from "./objects.db.ts";
import {sqlBuilder} from "./drizzle/sql-builder.ts";
import {DrizzleDataVersion, objectVersions} from "./drizzle/schema.ts";
import {DatabasesManagementAPI} from "../../database-management/database-management.ts";
import {Snapshot, VaultSnapshot} from "@headbase-app/common";


export class SnapshotTransactions {
	private readonly context: DeviceContext;

	constructor(
		config: EntityTransactionsConfig,
		private readonly databaseService: IDatabaseService,
		private readonly vaultsService: DatabasesManagementAPI
	) {
		this.context = config.context
	}

	async getSnapshot(databaseId: string): Promise<VaultSnapshot> {
		const vault = await this.vaultsService.get(databaseId)
		const versionsSnapshot: Snapshot = {}

		const versionsQuery = sqlBuilder
			.select({id: objectVersions.id, deleted_at: objectVersions.deleted_at})
			.from(objectVersions)
			.toSQL()
		const versions = await this.databaseService.exec({databaseId, ...versionsQuery, rowMode: 'object'}) as unknown as DrizzleDataVersion[]
		for (const version of versions) {
			versionsSnapshot[version.id] = !!version.deleted_at
		}

		return {
			vault: {
				updatedAt: vault.updatedAt,
			},
			versions: versionsSnapshot
		}
	}
}
