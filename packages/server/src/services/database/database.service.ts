import postgres, { Sql } from "postgres";

import {EnvironmentService} from "@services/environment/environment.service.js";
import {HealthStatus} from "@modules/server/server.service.js";


export class DatabaseService {
  private sql: Sql<any> | null = null;

  constructor(private envService: EnvironmentService) {}

  async getSQL() {
    if (this.sql) {
      return this.sql;
    }

    this.sql = postgres(this.envService.vars.database.url, {
      connection: {
        // This stops timestamps being returned in the server's timezone and leaves
        // timezone conversion upto API clients.
        timezone: "UTC",
      },
      transform: postgres.camel
    });
    return this.sql;
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      const sql = await this.getSQL()
      await sql`select 1`
      return "ok"
    }
    catch (error) {
      return "error";
    }
  }

  async onModuleDestroy() {
    if (this.sql) {
      await this.sql.end();
    }
  }
}
