import {EventMap, HeadbaseEvent} from "./events/events.ts";

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

export interface ExecutableData {
	databaseId: string,
	sql: string,
	// todo: make params optional?
	params: unknown[],
	rowMode?: 'array' | 'object'
}

export abstract class IDatabaseService {
	constructor(config: DatabaseServiceConfig) {}
	async open(databaseId: string, encryptionKey: string) {}
	async close(databaseId: string) {}
	async exec(data: ExecutableData): Promise<SqlQueryResponse> {
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
