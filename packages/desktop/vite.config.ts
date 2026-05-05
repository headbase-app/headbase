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
			'@apis': resolve('src/apis'),
			'@ui': resolve('src/ui'),
			// Ensure icons can be tree-shaken in dev mode (see /web/docs/technical-debt.md, thanks to https://christopher.engineering/en/blog/lucide-icons-with-vite-dev-server/)
			"lucide-solid/icons": fileURLToPath(
				new URL(
					// Relative path to access node_modules in root project of NPM workspaces
					"../../node_modules/lucide-solid/dist/source/icons",
					import.meta.url,
				),
			),
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
