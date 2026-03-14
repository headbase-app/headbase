import {html} from "lit";
import {ContextProvider, provide} from '@lit/context';
import { customElement, state } from "lit/decorators.js";
import {ContextProvider as VanillaContextProvider} from "@ui/components/context.js"

import {
	CommonEventsService,
	CommonPluginAPI,
	CommonTranslationsAPI,
	DeviceAPIContext, FilesAPIContext,
	HeadbaseCorePlugin, PluginAPIContext,
	TranslationsAPIContext, VaultsAPIContext, WorkspaceVaultAPIContext,
	MemoryRouter, PageRouterContext,
	routes, routePages, BaseElement,
	ObservableProperty, type LiveQueryResult, type VaultDto
} from "@headbase-app/lib";

import "../lib/04-ui/pages/welcome-page.ts"
import "../lib/04-ui/pages/select-vault-page.ts"
import "../lib/04-ui/pages/app-page.ts"

import {WebDatabaseService} from "@apis/database/web-database.service.ts";
import {WebDeviceApi} from "@apis/device/web-device.api.ts";
import {WebVaultsAPI} from "@apis/vaults/web-vaults.api.ts";
import {WebWorkspaceVaultAPI} from "@apis/workspace-vault/workspace-vault.api.ts";
import {WebFilesAPI} from "@apis/files/web-files.api.ts";
import {FileExplorer} from "@ui/components/file-explorer.ts";
import {
	FileExplorerVanilla,
	VanillaFilesAPIContext,
	VanillaWorkspaceVaultAPIContext
} from "@ui/components/file-explorer-vanilla.ts";

const translationsAPI = new CommonTranslationsAPI();
const databaseService = new WebDatabaseService();
const deviceAPI = new WebDeviceApi();
const eventsService = new CommonEventsService(deviceAPI);
const vaultsAPI = new WebVaultsAPI(databaseService, deviceAPI, eventsService);
const workspaceVaultAPI = new WebWorkspaceVaultAPI(deviceAPI, eventsService, vaultsAPI);
const filesAPI = new WebFilesAPI();
const pluginAPI = new CommonPluginAPI();
pluginAPI.registerPlugin(HeadbaseCorePlugin)

customElements.define(FileExplorer.tag, FileExplorer)
customElements.define(FileExplorerVanilla.tag, FileExplorerVanilla)

@customElement("hb-app")
export class HeadbaseApp extends BaseElement {
	static tag = "hb-app"
	contextProvider!: VanillaContextProvider

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

	@state() currentVault?: LiveQueryResult<VaultDto | null>
	currentVault$!: ObservableProperty<LiveQueryResult<VaultDto | null>>

	constructor() {
		super();
		this.contextProvider = new VanillaContextProvider()
		this.contextProvider.add(VanillaWorkspaceVaultAPIContext, this.workspaceVaultAPI)
		this.contextProvider.add(VanillaFilesAPIContext, this.filesAPI)
	}

	connectedCallback() {
		super.connectedCallback();
		this.currentVault$ = new ObservableProperty(this, this.workspaceVaultAPI.liveGet(), {
			reflectedProperty: "currentVault"
		})
	}

	render() {
		return html`
			<p>This is a test</p>
			<hb-file-explorer></hb-file-explorer>
			<hb-file-explorer-vanilla></hb-file-explorer-vanilla>
			${this.memoryRouter.outlet()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hb-app': HeadbaseApp
	}
}
