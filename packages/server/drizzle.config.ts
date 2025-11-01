import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Config for using the drizzle-kit CLI tool locally.
 *
 * See ./src/services/database/database.service.ts for runtime migrations.
 */
export default defineConfig({
	schema: "./src/services/database/schema/schema.ts",
	out: "./migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	migrations: {
		table: "_migrations",
		schema: "public",
	},
});
