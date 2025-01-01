import {
	IDatabaseService,
	DeviceContext,
	SqlDataType, SqlQueryResponse,
	DatabaseServiceConfig
} from "../../src/logic/services/database/interfaces";

export class MockDatabaseService implements IDatabaseService {
	private readonly context: DeviceContext

	constructor(config: DatabaseServiceConfig) {
		this.context = config.context
	}

	async close(databaseId: string): Promise<void> {}

	async destroy(): Promise<void> {}

	async exec(databaseId: string, sql: string, params: SqlDataType[]): Promise<SqlQueryResponse> {
		return {
			rows: []
		}
	}

	async open(databaseId: string, encryptionKey: string): Promise<void> {}
}
