import {SQLocalDrizzle} from "sqlocal/drizzle";
import {drizzle, type SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";

import {type IDatabaseService, schema} from "@headbase-app/libweb"

import {featureFlags} from "@common/feature-flags.ts";
import migration0 from "../../../../lib/services/database/migrations/00-setup.sql?raw";

export class WebDatabaseService implements IDatabaseService {
	sqLocalDrizzle?: SQLocalDrizzle
	#db?: SqliteRemoteDatabase<typeof schema>

	async getDatabase() {
		if (this.#db) {
			return this.#db;
		}

		this.sqLocalDrizzle = new SQLocalDrizzle({
			databasePath: "/headbase-v1/application.sqlite3",
			verbose: featureFlags().debug_sqlite
		});
		this.#db = drizzle(this.sqLocalDrizzle.driver, this.sqLocalDrizzle.batchDriver, {casing: "snake_case"});
		await this.#db.run(migration0)
		return this.#db
	}

	async destroy() {
		this.sqLocalDrizzle?.destroy()
	}
}
