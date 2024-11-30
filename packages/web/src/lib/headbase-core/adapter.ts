import {EventMap, HeadbaseEvent} from "../../logic/services/events/events.ts";

export type SqlDataType = string | number | boolean | null

export interface SqlQueryResponse {
	rows: never[][] | never[]
}

export interface DeviceContext {
	id: string
	name?: string
}


export interface DatabaseAdapterConfig {
	context: DeviceContext
}

export abstract class DatabaseAdapter {
	constructor(config: DatabaseAdapterConfig) {}
	async open(databaseId: string, encryptionKey: string) {}
	async close(databaseId: string) {}
	async exec(databaseId: string, sql: string, params: SqlDataType[]): Promise<SqlQueryResponse> {
		return new Promise<SqlQueryResponse>((r) => r({rows: []}))
	}
	async destroy() {}
}


export interface EventsAdapterConfig {
	context: DeviceContext
}

export abstract class EventsAdapter {
	constructor(config: EventsAdapterConfig) {}
	dispatch<Event extends keyof EventMap>(type: Event, data: EventMap[Event]['detail'], context?: DeviceContext): void {}
	subscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]['detail']>) => void): void {}
	unsubscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]['detail']>) => void): void {}
	subscribeAll(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {}
	unsubscribeAll(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {}
	async destroy() {}
}


export interface PlatformAdapterConfig {
	context: DeviceContext
}

export abstract class PlatformAdapter {
	constructor(config: PlatformAdapterConfig) {}
	async destroy() {}
	database!: DatabaseAdapter
	events!: EventsAdapter
}
