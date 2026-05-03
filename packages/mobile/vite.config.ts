import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

export default defineConfig({
	root: "./src",
	plugins: [solid()],
	resolve: {
		alias: {
			'@common': resolve('src/common'),
			'@apis': resolve('src/apis'),
			'@framework': resolve('src/framework'),
			'@ui': resolve('src/ui'),
			// Ensure icons can be tree-shaken in dev mode (see docs/technical-debt.md, thanks to https://christopher.engineering/en/blog/lucide-icons-with-vite-dev-server/)
			"lucide-solid/icons": fileURLToPath(
				new URL(
					// Relative path to access node_modules in root project of NPM workspaces
					"../../node_modules/lucide-solid/dist/source/icons",
					import.meta.url,
				),
			),
		}
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
		// dist is outside project root (src) so needs explicit definition and emptying.
		outDir: "../dist",
		emptyOutDir: true,
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
	},
	optimizeDeps: {
		// Exclude @headbase-app/lib otherwise Vite seems to pre-bundle assuming React and/or breaks pdfjs-dist worker import.
		exclude: ["@headbase-app/lib"]
	}
})
