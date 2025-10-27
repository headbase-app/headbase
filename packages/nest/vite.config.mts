import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		// E2E tests affect the database, so must be run in series.
		fileParallelism: false,
		// deps: {
		// 	interopDefault: true,
		// },
		include: ["**/*.e2e.test.ts", "**/*.unit.test.ts"],
	},
});
