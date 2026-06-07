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
		outDir: "../dist",
		cssMinify: "lightningcss",
	},
	server: {
		port: 42101
	},
})
