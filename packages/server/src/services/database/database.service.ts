import postgres, { Sql } from "postgres";
import {sql} from "drizzle-orm";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "./schema.js";
import {EnvironmentService} from "@services/environment/environment.service.js";
import {HealthStatus} from "@modules/server/server.service.js";


export class DatabaseService {
  private readonly driver: Sql<any>;
  private readonly db: PostgresJsDatabase<typeof schema>;

  constructor(private envService: EnvironmentService) {
    this.driver = postgres(this.envService.vars.database.url, {
      connection: {
        // This stops timestamps being returned in the server's timezone and leaves timezone conversion to API clients.
        timezone: "UTC",
      },
      // todo: will this option be needed after migrating to Drizzle?
      transform: postgres.camel
    });

    this.db = drizzle({
      schema,
      client: this.driver,
      casing: "snake_case",
    })

    // Undo the custom date parsers overrides which Drizzle makes to the database driver
    // https://github.com/porsager/postgres/discussions/761
    // https://github.com/drizzle-team/drizzle-orm/blob/c8359a16fff4b05aff09445edd63fc65a7430ce9/drizzle-orm/src/postgres-js/driver.ts#L25
    // Maybe https://github.com/drizzle-team/drizzle-orm/issues/1757 & https://github.com/drizzle-team/drizzle-orm/issues/1626?
    // todo: is this an actual issue, or just a symptom of me doing something wrong? it surely must be the second one. I should review once I've fully migrated to Drizzle.
    for (const type of ["1184", "1082", "1083", "1114"]) {
      this.driver.options.parsers[type as any] = x => new Date(x);
      this.driver.options.serializers[type as any] = x => (x instanceof Date ? x : new Date(x)).toISOString()
    }
    this.driver.options.serializers["114"] = (x) => JSON.stringify(x);
    this.driver.options.serializers["3802"] = (x) => JSON.stringify(x);
  }

  async getSQL(): Promise<Sql> {
    return this.driver
  }

  getDatabase(): PostgresJsDatabase<typeof schema> {
    return this.db;
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      await this.db.execute(sql`select 1`)
      return "ok"
    }
    catch (error) {
      return "error";
    }
  }

  async onModuleDestroy() {
    await this.driver.end()
  }
}
