import {html, render} from "lit-html";
import {choose} from "lit-html/directives/choose.js";
import {BehaviorSubject, type Subscription} from "rxjs";

import {
	CommonEventsService,
	CommonPluginAPI,
	CommonTranslationsAPI,
	DeviceAPIContext, FilesAPIContext,
	HeadbaseCorePlugin, PluginAPIContext,
	TranslationsAPIContext, VaultsAPIContext, WorkspaceVaultAPIContext,
	routes, BaseElement,
	type LiveQueryResult, type VaultDto,
	ContextProvider, LIVE_QUERY_LOADING_STATE, createContext, LiveQueryStatus,
} from "@headbase-app/lib";

import {WebDatabaseService} from "@apis/database/web-database.service.ts";
import {WebDeviceApi} from "@apis/device/web-device.api.ts";
import {WebVaultsAPI} from "@apis/vaults/web-vaults.api.ts";
import {WebWorkspaceVaultAPI} from "@apis/workspace-vault/workspace-vault.api.ts";
import {WebFilesAPI} from "@apis/files/web-files.api.ts";

const translationsAPI = new CommonTranslationsAPI();
const databaseService = new WebDatabaseService();
const deviceAPI = new WebDeviceApi();
const eventsService = new CommonEventsService(deviceAPI);
const vaultsAPI = new WebVaultsAPI(databaseService, deviceAPI, eventsService);
const workspaceVaultAPI = new WebWorkspaceVaultAPI(deviceAPI, eventsService, vaultsAPI);
const filesAPI = new WebFilesAPI(eventsService);
const pluginAPI = new CommonPluginAPI();
pluginAPI.registerPlugin(HeadbaseCorePlugin)

export const CurrentPageContext = createContext<BehaviorSubject<string>>("CurrentPage")

export class HeadbaseApp extends BaseElement {
	static tag = "hb-app"
	contextProvider: ContextProvider

	currentPage$: BehaviorSubject<string>
	currentVault$: BehaviorSubject<LiveQueryResult<VaultDto | null>>
	currentVaultSub: Subscription

	constructor() {
		super();
		this.contextProvider = new ContextProvider()
		this.contextProvider.add(TranslationsAPIContext, translationsAPI)
		this.contextProvider.add(DeviceAPIContext, deviceAPI)
		this.contextProvider.add(VaultsAPIContext, vaultsAPI)
		this.contextProvider.add(WorkspaceVaultAPIContext, workspaceVaultAPI)
		this.contextProvider.add(FilesAPIContext, filesAPI)
		this.contextProvider.add(PluginAPIContext, pluginAPI)

		this.currentPage$ = this.observedState(routes.selectVault)
		this.contextProvider.add(CurrentPageContext, this.currentPage$)

		this.currentVault$ = this.observedState<LiveQueryResult<VaultDto | null>>(LIVE_QUERY_LOADING_STATE, workspaceVaultAPI.liveGet())
		this.currentVaultSub = this.currentVault$.subscribe((v) => this.handleVaultChange(v))
	}

	handleVaultChange(state: LiveQueryResult<VaultDto | null>) {
		if (state.status === LiveQueryStatus.SUCCESS) {
			if (state.result) {
				this.currentPage$.next(routes.app)
			} else {
				this.currentPage$.next(routes.selectVault)
			}
		}
	}

	render() {
		render(html`
			${choose(this.currentPage$.value, [
				[routes.welcome, () => html`<hb-page-welcome></hb-page-welcome>`],
				[routes.selectVault, () => html`<hb-page-select-vault></hb-page-select-vault>`],
				[routes.app, () => html`<hb-page-app></hb-page-app>`],
			])}
    `, this)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hb-app': HeadbaseApp
	}
}
