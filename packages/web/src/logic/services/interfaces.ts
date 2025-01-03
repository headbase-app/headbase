import {EventMap, HeadbaseEvent} from "./events/events.ts";

// todo: basic types should be defined elsewhere?
export type SqlDataType = string | number | boolean | null

export interface SqlQueryResponse {
	rows: never[][] | never[]
}

export interface DeviceContext {
	id: string
	name?: string
}


export interface DatabaseServiceConfig {
	context: DeviceContext
}

export abstract class IDatabaseService {
	constructor(config: DatabaseServiceConfig) {}
	async open(databaseId: string, encryptionKey: string) {}
	async close(databaseId: string) {}
	async exec(databaseId: string, sql: string, params: SqlDataType[]): Promise<SqlQueryResponse> {
		return new Promise<SqlQueryResponse>((r) => r({rows: []}))
	}
	async destroy() {}
}


export interface EventsServiceConfig {
	context: DeviceContext
}

export abstract class IEventsService {
	constructor(config: EventsServiceConfig) {}
	dispatch<Event extends keyof EventMap>(type: Event, data: EventMap[Event]['detail'], context?: DeviceContext): void {}
	subscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]['detail']>) => void): void {}
	unsubscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]['detail']>) => void): void {}
	subscribeAll(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {}
	unsubscribeAll(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {}
	async destroy() {}
}
