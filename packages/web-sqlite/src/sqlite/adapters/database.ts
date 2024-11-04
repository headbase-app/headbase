
export interface QueryResponse {
	rows: any[][] | any[]
}

export abstract class DatabaseAdapter {
	constructor(databaseFilename: string) {}

	async init(): Promise<void> {}

	async close(): Promise<void> {}

	async run(sql: string, params: any[]): Promise<QueryResponse> {
		return {rows: []}
	}
}
