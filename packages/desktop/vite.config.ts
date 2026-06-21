import { defineConfig } from 'vite';
import {resolve} from "node:path";

// This is the Vite config for the Electron render process / frontend app.

// https://vitejs.dev/config
export default defineConfig({
	root: "./src",
	resolve: {
		alias: {
			'@headbase-app/lib': resolve('lib/index.ts'),
			'@apis': resolve('src/apis'),
			'@ui': resolve('src/ui'),
		}
	},
	worker: {
		format: "es"
	},
	optimizeDeps: {
		// Exclude @headbase-app/lib otherwise Vite seems to pre-bundle assuming React and/or breaks pdfjs-dist worker import.
		exclude: ["@headbase-app/lib"],
	}
});
