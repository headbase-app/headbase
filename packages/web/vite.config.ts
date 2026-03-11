import { defineConfig } from 'vite'
import {resolve} from "node:path";

export default defineConfig({
  plugins: [],
	resolve: {
		alias: {
			'@headbase-app/lib': resolve('lib/index.ts'),
			'@apis': resolve('src/apis'),
			'@utils': resolve('src/utils'),
			'@ui': resolve('src/ui'),
		}
	},
	optimizeDeps: {
		exclude: ['sqlocal'],
	},
	css: {
		transformer: "lightningcss",
		lightningcss: {
			drafts: {
				customMedia: true
			}
		}
	},
	build: {
		cssMinify: "lightningcss",
	},
	server: {
		port: 42101,
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
		},
	},
	worker: {
		format: "es"
	}
})
