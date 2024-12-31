import {
	DatabaseAdapter,
	DatabaseAdapterConfig,
	DeviceContext,
	SqlDataType, SqlQueryResponse
} from "../../src/logic/services/database/adapter";

export class MockDatabaseAdapter implements DatabaseAdapter {
	readonly #context: DeviceContext

	constructor(config: DatabaseAdapterConfig) {
		this.#context = config.context
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