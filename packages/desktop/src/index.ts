import { html } from "lit-html";

import {
	BaseElement,
	CommonEventsService,
	DeviceAPIContext, FilesAPIContext, HeadbaseApp,
	PluginStore, HeadbaseCorePlugin,
	VaultsAPIContext,
	WorkspaceVaultAPIContext, PluginAPIContext, FileExplorer, FileTreeItem, VaultManager, VaultsList, VaultForm,
	CreateVault, EditVault, DeleteVault, VaultMenu,
} from "@headbase-app/lib";
import {ContextProvider} from "@headbase-app/lib";

import {DeviceAPI} from "@apis/device/device.api.ts";
import {VaultsAPI} from "@apis/vaults/vaults.api.ts";
import {WorkspaceVaultAPI} from "@apis/workspace-vault/workspace-vault.api.ts";
import {FilesAPI} from "@apis/files/files.api.ts";
import {WelcomePage} from "../lib/04-ui/pages/welcome-page.ts";
import {AppPage} from "../lib/04-ui/pages/app-page.ts";
import {ManageVaultsPage} from "../lib/04-ui/pages/manage-vaults-page.ts";

import "./index.css"

customElements.define(WelcomePage.tag, WelcomePage)
customElements.define(ManageVaultsPage.tag, ManageVaultsPage)
customElements.define(AppPage.tag, AppPage)

customElements.define(VaultManager.tag, VaultManager)
customElements.define(VaultsList.tag, VaultsList)
customElements.define(VaultForm.tag, VaultForm)
customElements.define(CreateVault.tag, CreateVault)
customElements.define(EditVault.tag, EditVault)
customElements.define(DeleteVault.tag, DeleteVault)

customElements.define(VaultMenu.tag, VaultMenu)

customElements.define(FileExplorer.tag, FileExplorer)
customElements.define(FileTreeItem.tag, FileTreeItem)

customElements.define(HeadbaseApp.tag, HeadbaseApp)

export class HeadbaseDesktopApp extends BaseElement {
	static tag = 'hb-desktop-app';
	contextProvider: ContextProvider

	constructor() {
		super();
		const deviceAPI = new DeviceAPI();
		const eventsService = new CommonEventsService(deviceAPI);
		const vaultsAPI = new VaultsAPI(eventsService, deviceAPI);
		const workspaceVaultAPI = new WorkspaceVaultAPI(eventsService, deviceAPI, vaultsAPI);
		const filesAPI = new FilesAPI(eventsService);

		const pluginStore = new PluginStore(deviceAPI, filesAPI);
		pluginStore.registerBasePlugin(HeadbaseCorePlugin);

		this.contextProvider = new ContextProvider(document, "hb-desktop-app")
		this.contextProvider.add(DeviceAPIContext, deviceAPI)
		this.contextProvider.add(VaultsAPIContext, vaultsAPI)
		this.contextProvider.add(WorkspaceVaultAPIContext, workspaceVaultAPI)
		this.contextProvider.add(FilesAPIContext, filesAPI)
		this.contextProvider.add(PluginAPIContext, pluginStore)
	}

	render() {
		return html`<hb-app/>`
	}
}
customElements.define(HeadbaseDesktopApp.tag, HeadbaseDesktopApp)

declare global {
	interface HTMLElementTagNameMap {
		[HeadbaseDesktopApp.tag]: HeadbaseDesktopApp
	}
}
