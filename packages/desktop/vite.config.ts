import { defineConfig } from 'vite';
import solid from "vite-plugin-solid";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

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
	plugins: [
		// @ts-expect-error -- todo: plugin types don't match?
		solid()
	],
	worker: {
		format: "es"
	},
	optimizeDeps: {
		// Exclude @headbase-app/lib otherwise Vite seems to pre-bundle assuming React and/or breaks pdfjs-dist worker import.
		exclude: ["@headbase-app/lib"],
	}
});
