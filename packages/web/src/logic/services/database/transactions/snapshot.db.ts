import {Snapshot} from "../db.ts";
import {DeviceContext, IDatabaseService, IEventsService} from "../../interfaces.ts";
import {EntityTransactionsConfig} from "./objects.db.ts";
import {sqlBuilder} from "./drizzle/sql-builder.ts";
import {DrizzleDataVersion, objectVersions} from "./drizzle/schema.ts";


export class SnapshotTransactions {
	private readonly context: DeviceContext;

	constructor(
		config: EntityTransactionsConfig,
		private readonly eventsService: IEventsService,
		private readonly databaseService: IDatabaseService
	) {
		this.context = config.context
	}

	async getSnapshot(databaseId: string): Promise<Snapshot> {
		const snapshot: Snapshot = {}

		const versionsQuery = sqlBuilder
			.select({id: objectVersions.id, is_deleted: objectVersions.is_deleted})
			.from(objectVersions)
			.toSQL()
		const versions = await this.databaseService.exec({databaseId, ...versionsQuery, rowMode: 'object'}) as unknown as DrizzleDataVersion[]
		for (const version of versions) {
			snapshot[version.id] = version.is_deleted === 1
		}

		return snapshot
	}
}
