import {DeviceContext} from "../../interfaces.ts";
import {EntityTransactionsConfig, ObjectTransactions} from "./objects.db.ts";
import {DatabaseExport} from "../../../schemas/export.ts";
import {HEADBASE_SPEC_VERSION} from "../../../headbase-web.ts";


export class MigrationTransactions {
	private readonly context: DeviceContext;

	constructor(
		config: EntityTransactionsConfig,
		private readonly objectStore: ObjectTransactions,
	) {
		this.context = config.context
	}

	async export(databaseId: string): Promise<DatabaseExport> {
		const objects = await this.objectStore.query(databaseId, {filter: {isDeleted: false}});

		return {
			spec: HEADBASE_SPEC_VERSION,
			createdAt: new Date().toISOString(),
			data: objects
		}
	}

	async import(databaseId: string, importData: DatabaseExport): Promise<void> {
		throw new Error("Import not implemented.");
	}
}
