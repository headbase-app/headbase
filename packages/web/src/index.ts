import {html} from "lit";
import {ContextProvider, provide} from '@lit/context';
import { customElement, property } from "lit/decorators.js";

import {
	CommonEventsService,
	CommonPluginAPI,
	CommonTranslationsAPI,
	DeviceAPIContext, FilesAPIContext,
	HeadbaseCorePlugin, PluginAPIContext,
	TranslationsAPIContext, VaultsAPIContext, WorkspaceVaultAPIContext,
	MemoryRouter, PageRouterContext,
	routes, routePages, BaseElement, type LiveQueryResult, type IWorkspaceVaultAPI, type VaultDto,
	ObservableProperty, LIVE_QUERY_LOADING_STATE
} from "@headbase-app/lib";

import "../lib/04-ui/pages/welcome-page.ts"
import "../lib/04-ui/pages/select-vault-page.ts"
import "../lib/04-ui/pages/app-page.ts"

import {WebDatabaseService} from "@apis/database/web-database.service.ts";
import {WebDeviceApi} from "@apis/device/web-device.api.ts";
import {WebVaultsAPI} from "@apis/vaults/web-vaults.api.ts";
import {WebWorkspaceVaultAPI} from "@apis/workspace-vault/workspace-vault.api.ts";
import {WebFilesAPI} from "@apis/files/web-files.api.ts";
import {of, switchMap} from "rxjs";

const translationsAPI = new CommonTranslationsAPI();
const databaseService = new WebDatabaseService();
const deviceAPI = new WebDeviceApi();
const eventsService = new CommonEventsService(deviceAPI);
const vaultsAPI = new WebVaultsAPI(databaseService, deviceAPI, eventsService);
const workspaceVaultAPI = new WebWorkspaceVaultAPI(deviceAPI, eventsService, vaultsAPI);
const filesAPI = new WebFilesAPI();
const pluginAPI = new CommonPluginAPI();
pluginAPI.registerPlugin(HeadbaseCorePlugin)

@customElement("hb-app")
export class HeadbaseApp extends BaseElement {
	@provide({context: TranslationsAPIContext}) translationsAPI = translationsAPI
	@provide({context: DeviceAPIContext}) deviceAPI = deviceAPI
	@provide({context: VaultsAPIContext}) vaultsAPI = vaultsAPI
	@provide({context: WorkspaceVaultAPIContext}) workspaceVaultAPI = workspaceVaultAPI
	@provide({context: FilesAPIContext}) filesAPI = filesAPI
	@provide({context: PluginAPIContext}) pluginAPI = pluginAPI

	currentPage = new ContextProvider(this, {context: PageRouterContext, initialValue: routes.app})
	memoryRouter = new MemoryRouter({
		host: this,
		context: this.currentPage,
		routes: routePages
	})

	currentVault = new ObservableProperty({host: this, observable: this.workspaceVaultAPI.liveGet()})
	// todo: next steps for ObservableProperty
	// - allow render updates via async directives rather than 'forceUpdateRender' via controller?
	// - how to implement effects run on observed value change?

	// proof of concept for composing observables into single property:
	fileTree = new ObservableProperty({
		host: this,
		observable:
			this.workspaceVaultAPI.liveGet()
				.pipe(
					switchMap(vaultQuery => {
						if (vaultQuery.status === "success" && vaultQuery.result) {
							return this.filesAPI.tree(vaultQuery.result?.path)
						}
						return of(null)
					})
				)
	})

	render() {
		console.debug(this.currentVault.value)
		console.debug(this.fileTree.value)

		return html`
			<p>This is a test</p>
			${this.memoryRouter.outlet()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hb-app': HeadbaseApp
	}
}
