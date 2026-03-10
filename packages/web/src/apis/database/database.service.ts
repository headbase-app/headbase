import type {SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {schema} from "./schema.ts";

export interface IDatabaseService {
	getDatabase(): Promise<SqliteRemoteDatabase<typeof schema>>
	destroy(): Promise<void>
}
