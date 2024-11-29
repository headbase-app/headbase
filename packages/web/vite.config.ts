/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		port: 42101,
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
		},
	},
	plugins: [
		tsconfigPaths(),
		react(),
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
		}),
	],
	test: {
		environment: "happy-dom",
		include: ["**/*.unit.test.{ts,tsx}"],
	}
});
