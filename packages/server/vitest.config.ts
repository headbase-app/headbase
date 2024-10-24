import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        fileParallelism: false,
        include: [
            "**/*.e2e.test.ts",
            "**/*.unit.test.ts"
        ]
    },
})
