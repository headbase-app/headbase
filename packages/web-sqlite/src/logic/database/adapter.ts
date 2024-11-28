import {EventMap, HeadbaseEvent} from "../services/events/events.ts";

export type SqlDataType = string | number | boolean | null

export interface SqlQueryResponse {
	rows: never[][] | never[]
}

// todo: rename to something better?
export interface DeviceContext {
	id: string
	name?: string
}

export interface PlatformAdapterConfig {
	context: DeviceContext
}

export abstract class PlatformAdapter {
	// Lifecycle methods
	constructor(config: PlatformAdapterConfig) {}
	async init() {}
	async destroy() {}
	// Database methods
	async openDatabase(databaseId: string) {}
	async closeDatabase(databaseId: string) {}
	async runSql(databaseId: string, sql: string, params: SqlDataType[]): Promise<SqlQueryResponse> {
		return new Promise<SqlQueryResponse>((r) => r({rows: []}))
	}
	// Event methods
	dispatchEvent<Event extends keyof EventMap>(type: Event, data: EventMap[Event]['detail'], context?: DeviceContext): void {}
	subscribeEvent<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]['detail']>) => void): void {}
	unsubscribeEvent<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]['detail']>) => void): void {}
	subscribeAllEvents(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {}
	unsubscribeAllEvents(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {}
}
