import { defineConfig } from 'vite'
import {resolve} from "node:path";

// https://vitejs.dev/config
export default defineConfig({
	root: "./src",
	resolve: {
		alias: {
			'@apis': resolve('src/apis'),
			'@ui': resolve('src/ui'),
		}
	},
	server: {
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
		},
	},
	worker: {
		format: "es"
	},
	build: {
		outDir: "../dist",
		emptyOutDir: true,
	},
	optimizeDeps: {
		// Exclude @headbase-app/lib otherwise Vite seems to pre-bundle assuming React and/or breaks pdfjs-dist worker import.
		exclude: ["@headbase-app/lib"]
	}
})
