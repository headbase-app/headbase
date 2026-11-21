import { defineConfig } from 'vite'
import {resolve} from "node:path";

// https://vitejs.dev/config
export default defineConfig({
	root: "./src",
	resolve: {
		alias: {
			'@headbase-app/lib': resolve('src/lib/index.ts'),
			'@apis': resolve('src/apis'),
			'@ui': resolve('src/ui'),
		}
	},
	worker: {
		format: "es"
	},
	server: {
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
		},
	},
	optimizeDeps: {
		// Exclude @headbase-app/lib otherwise Vite seems to pre-bundle assuming React and/or breaks pdfjs-dist worker import.
		// exclude: ["@headbase-app/lib"],
		exclude: ['@sqlite.org/sqlite-wasm'],
	},
	plugins: [
		{
			name: 'configure-response-headers',
			configureServer: (server) => {
				server.middlewares.use((_req, res, next) => {
					res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
					res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
					next();
				});
			},
		},
	],
})
