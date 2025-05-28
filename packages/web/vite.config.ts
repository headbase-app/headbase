/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from '@tailwindcss/vite'

/**
 * A Workbox plugin to add COOP/COEP headers to all assets when served via the service worker cache.
 * Copied from https://github.com/GoogleChrome/workbox/issues/2963.
 */
const headersPlugin = {
	handlerWillRespond: async ({response}) => {
		const headers = new Headers(response.headers);
		headers.set("Cross-Origin-Embedder-Policy", "require-corp");
		headers.set("Cross-Origin-Opener-Policy", "same-origin");

		return new Response(response.body, {
			headers,
			status: response.status,
			statusText: response.statusText,
		});
	},
};

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		port: 42101,
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
		},
	},
	optimizeDeps: {
		exclude: ['sqlocal'],
	},
	plugins: [
		tsconfigPaths(),
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				name: "Headbase",
				short_name: "Headbase",
				description:
          "The customizable database for your brain. Note-taking, task-management, personal knowledge bases and more.",
				theme_color: "#0c857a",
				icons: [
					{
						src: "/icons/icon-192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/icons/icon-512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "/icons/icon-512-maskable.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
			workbox: {
				runtimeCaching: [
					{
						urlPattern: ({request}) => ['document', 'iframe', 'worker'].includes(request.destination),
						handler: 'NetworkOnly',
						options: {
							plugins: [headersPlugin],
						},
					},
				],
			}
		}),
	]
});
