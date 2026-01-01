import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

export default defineConfig({
  plugins: [solid()],
	resolve: {
		alias: {
			'@': resolve('src'),
			'@contracts': resolve('src/contracts'),
			'@api': resolve('src/api'),
			'@ui': resolve('src/ui'),
			'@utils': resolve('src/utils'),
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
