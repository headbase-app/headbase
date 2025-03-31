import {Snapshot} from "../db.ts";
import {DeviceContext, IDatabaseService} from "../../interfaces.ts";
import {EntityTransactionsConfig} from "./objects.db.ts";
import {sqlBuilder} from "./drizzle/sql-builder.ts";
import {DrizzleDataVersion, objectVersions} from "./drizzle/schema.ts";
import {VaultSnapshot} from "../../sync/sync-logic.ts";
import {DatabasesManagementAPI} from "../../database-management/database-management.ts";


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
			.select({id: objectVersions.id, is_deleted: objectVersions.is_deleted})
			.from(objectVersions)
			.toSQL()
		const versions = await this.databaseService.exec({databaseId, ...versionsQuery, rowMode: 'object'}) as unknown as DrizzleDataVersion[]
		for (const version of versions) {
			versionsSnapshot[version.id] = version.is_deleted === 1
		}

		return {
			vault: {
				updatedAt: vault.updatedAt,
			},
			versions: versionsSnapshot
		}
	}
}
