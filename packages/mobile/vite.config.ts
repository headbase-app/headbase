import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

export default defineConfig({
	plugins: [solid()],
	resolve: {
		alias: {
			'@headbase-app/libweb': resolve('lib/index.ts'),
			'@common': resolve('src/common'),
			'@apis': resolve('src/apis'),
			'@framework': resolve('src/framework'),
			'@ui': resolve('src/ui'),
			// Ensure icons can be tree-shaken in dev mode (see docs/technical-debt.md, thanks to https://christopher.engineering/en/blog/lucide-icons-with-vite-dev-server/)
			"lucide-solid/icons": fileURLToPath(
				new URL(
					"./node_modules/lucide-solid/dist/source/icons",
					import.meta.url,
				),
			),
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
		cssMinify: "lightningcss"
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
