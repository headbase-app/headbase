
export interface SqlQueryResponse {
	rows: any[][] | any[]
}

export interface AdapterOptions {
	databaseId: string
	contextId: string
}

export abstract class DatabaseAdapter {
	constructor(options: AdapterOptions) {}

	async close(): Promise<void> {}

	async run(sql: string, params: any[]): Promise<SqlQueryResponse> {
		return {rows: []}
	}
}
