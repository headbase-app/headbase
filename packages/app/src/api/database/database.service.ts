import {drizzle, SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {SQLocalDrizzle} from "sqlocal/drizzle";

import {schema} from "@api/database/schema.ts";
import {featureFlags} from "@/feature-flags.ts";
import migration0 from "@api/database/migrations/00-setup.sql?raw"

export class DatabaseService {
	#db?: SqliteRemoteDatabase<typeof schema>

	async getDatabase(): Promise<SqliteRemoteDatabase<typeof schema>> {
		if (this.#db) return this.#db;

		const { driver, batchDriver } = new SQLocalDrizzle({
			databasePath: "/headbase-v1/app.sqlite3",
			verbose: featureFlags().debug_sqlite
		});
		this.#db = drizzle(driver, batchDriver, {casing: "snake_case"});

		// Run database migrations
		await this.#db.run(migration0)
		return this.#db;
	}
}
