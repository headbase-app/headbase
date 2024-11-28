import { EventMap, HeadbaseEvent } from "../services/events/events.ts";
export type SqlDataType = string | number | boolean | null;
export interface SqlQueryResponse {
    rows: never[][] | never[];
}
export interface DeviceContext {
    id: string;
    name?: string;
}
export interface PlatformAdapterConfig {
    context: DeviceContext;
}
export declare abstract class PlatformAdapter {
    constructor(config: PlatformAdapterConfig);
    init(): Promise<void>;
    destroy(): Promise<void>;
    openDatabase(databaseId: string): Promise<void>;
    closeDatabase(databaseId: string): Promise<void>;
    runSql(databaseId: string, sql: string, params: SqlDataType[]): Promise<SqlQueryResponse>;
    dispatchEvent<Event extends keyof EventMap>(type: Event, data: EventMap[Event]['detail'], context?: DeviceContext): void;
    subscribeEvent<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]['detail']>) => void): void;
    unsubscribeEvent<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]['detail']>) => void): void;
    subscribeAllEvents(listener: (e: CustomEvent<HeadbaseEvent>) => void): void;
    unsubscribeAllEvents(listener: (e: CustomEvent<HeadbaseEvent>) => void): void;
}
