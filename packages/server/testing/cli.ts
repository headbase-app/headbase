import * as dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";
import {resetTestData} from "./database-scripts.js";


async function run() {
  console.log("Starting database script")

  // todo: use DatabaseService rather than having to match postgres config here.
  const sql = postgres(process.env.DATABASE_URL as string, {
    connection: {
      // This stops timestamps being returned in the server's timezone and leaves
      // timezone conversion upto API clients.
      timezone: "UTC"
    },
    transform: postgres.camel
  });

  await resetTestData(sql, {logging: true, seedItems: true});

  process.exit(0);
}
run();
