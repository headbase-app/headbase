import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import {resolve} from "node:path";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()]
	},
	preload: {
		plugins: [externalizeDepsPlugin()]
	},
	renderer: {
		resolve: {
			alias: {
				'@contracts': resolve('src/contracts'),
				'@api': resolve('src/renderer/src/api'),
				'@framework': resolve('src/renderer/src/framework'),
				'@ui': resolve('src/renderer/src/ui'),
				'@utils': resolve('src/renderer/src/utils')
			}
		},
		plugins: [
			react(),
			tailwindcss(),
		]
	}
})
