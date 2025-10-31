import postgres, { Sql } from "postgres";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Injectable } from "@nestjs/common";

import { schema } from "./schema/schema";
import { ConfigService } from "@services/config/config.service";
import { HealthStatus } from "@modules/server/server.service";

@Injectable()
export class DatabaseService {
	private readonly driver: Sql<any>;
	private readonly db: PostgresJsDatabase<typeof schema>;

	constructor(private configService: ConfigService) {
		this.driver = postgres(this.configService.vars.database.url, {
			connection: {
				// This stops timestamps being returned in the server's timezone and leaves timezone conversion to API clients.
				timezone: "UTC",
			},
			// todo: will this option be needed after migrating to Drizzle?
			transform: postgres.camel,
			// Silencing log messages, which are sent for every migration run triggered.
			onnotice: () => {},
		});

		this.db = drizzle({
			schema,
			client: this.driver,
			casing: "snake_case",
		});

		// Undo the custom date parsers overrides which Drizzle makes to the database driver
		// https://github.com/porsager/postgres/discussions/761
		// https://github.com/drizzle-team/drizzle-orm/blob/c8359a16fff4b05aff09445edd63fc65a7430ce9/drizzle-orm/src/postgres-js/driver.ts#L25
		// Maybe https://github.com/drizzle-team/drizzle-orm/issues/1757 & https://github.com/drizzle-team/drizzle-orm/issues/1626?
		// todo: is this an actual issue, or just a symptom of me doing something wrong? it surely must be the second one. I should review once I've fully migrated to Drizzle.
		// for (const type of ["1184", "1082", "1083", "1114"]) {
		//   this.driver.options.parsers[type as any] = x => new Date(x);
		//   this.driver.options.serializers[type as any] = x => (x instanceof Date ? x : new Date(x)).toISOString()
		// }
		// this.driver.options.serializers["114"] = (x) => JSON.stringify(x);
		// this.driver.options.serializers["3802"] = (x) => JSON.stringify(x);
	}

	async onApplicationBootstrap() {
		await migrate(this.db, { migrationsFolder: "./migrations", migrationsSchema: "public", migrationsTable: "migrations" });
	}

	getSQL(): Sql {
		return this.driver;
	}

	getDatabase(): PostgresJsDatabase<typeof schema> {
		return this.db;
	}

	async healthCheck(): Promise<HealthStatus> {
		try {
			await this.db.execute(sql`select 1`);
			return "ok";
		} catch (error) {
			return "error";
		}
	}

	async onModuleDestroy() {
		await this.driver.end();
	}
}
