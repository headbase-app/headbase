import {EventMap, HeadbaseEvent} from "../services/events/events.ts";

export interface SqlQueryResponse {
	rows: any[][] | any[]
}

// todo: rename to something better?
export interface DeviceContext {
	databaseId: string
	contextId: string
}

export abstract class PlatformAdapter {
	// Lifecycle methods
	async init() {}
	async destroy() {}
	// Database methods
	async openDatabase(context: DeviceContext) {}
	async closeDatabase(context: DeviceContext) {}
	async runSql(context: DeviceContext, sql: string, params: any[]): Promise<SqlQueryResponse> {
		return new Promise<SqlQueryResponse>((r) => r({rows: []}))
	}
	// Event methods
	dispatchEvent<Event extends keyof EventMap>(type: Event, data: EventMap[Event]['detail']['data'], context?: DeviceContext): void {}
	subscribeEvent<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]['detail']>) => void): void {}
	unsubscribeEvent<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]['detail']>) => void): void {}
	subscribeAllEvents(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {}
	unsubscribeAllEvents(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {}
}
