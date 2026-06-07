import { html } from "lit-html";
import {choose} from "lit-html/directives/choose.js";
import { BehaviorSubject, Subscription } from "rxjs";

import {BaseElement} from "./03-framework/base-element.ts";
import {LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "./01-common/control-flow.ts";
import {VaultDto} from "./02-apis/vaults/vault.ts";

import {ContextProvider, createContext, useContext} from "./03-framework/context.ts";
import {VaultsAPIContext, WorkspaceVaultAPIContext} from "./03-framework/contexts.ts";

export const AppRouterContext = createContext<BehaviorSubject<string>>("AppRouter")
const routes = {
	splash: "/",
	welcome: "/welcome",
	manageVaults: "/manage-vaults",
	app: "/app"
}

export class HeadbaseApp extends BaseElement {
	static tag = "hb-app"

	contextProvider: ContextProvider

	vaultsAPI = useContext(VaultsAPIContext);
	workspaceVaultAPI = useContext(WorkspaceVaultAPIContext)

	currentPage$: BehaviorSubject<string>
	currentVault$: BehaviorSubject<LiveQueryResult<VaultDto | null>>
	currentVaultSub: Subscription

	constructor() {
		super();
		this.contextProvider = new ContextProvider(this, "hb-app")
		this.currentPage$ = this.createState(routes.splash)
		this.contextProvider.add(AppRouterContext, this.currentPage$)
		this.currentVault$ = this.createState<LiveQueryResult<VaultDto | null>>(LIVE_QUERY_LOADING_STATE, this.workspaceVaultAPI.liveGet())
		this.currentVaultSub = this.currentVault$.subscribe((v) => this.handleVaultChange(v))
	}

	async connectedCallback() {
		const isFilePermissionGranted = await this.vaultsAPI.checkPermissions()
		if (!isFilePermissionGranted) {
			console.debug(`[hb-app] File permissions check failed, requesting permissions`)
			await this.vaultsAPI.requestPermissions()
		}
		else {
			console.debug("[hb-app] File permissions check succeeded")
		}
	}

	handleVaultChange(state: LiveQueryResult<VaultDto | null>) {
		if (state.status === LiveQueryStatus.SUCCESS) {
			if (state.result) {
				this.currentPage$.next(routes.app)
			} else {
				this.currentPage$.next(routes.manageVaults)
			}
		}
		// todo: handle error?
	}

	render() {
		return html`
			${choose(this.currentPage$.value, [
				[routes.splash, () => html`<hb-page-splash></hb-page-splash>`],
				[routes.welcome, () => html`<hb-page-welcome></hb-page-welcome>`],
				[routes.manageVaults, () => html`<hb-page-manage-vaults></hb-page-manage-vaults>`],
				[routes.app, () => html`<hb-page-app></hb-page-app>`],
		])}
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[HeadbaseApp.tag]: HeadbaseApp
	}
}

