import {html} from "lit";
import type {Routes} from "./03-framework/memory-router.ts";

export const routes = {
	welcome: "/welcome",
	selectVault: "/select-vault",
	app: "/app"
} as const

export const routePages: Routes = [
	{path: routes.welcome, render: () => html`<hb-welcome-page/>`},
	{path: routes.selectVault, render: () => html`<hb-select-vault-page/>`},
	{path: routes.app, render: () => html`<hb-app-page/>`}
]
