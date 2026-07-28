import { html } from "lit-html";

import {
	BaseElement,
	CommonEventsService,
	DeviceAPIContext, FilesAPIContext, HeadbaseApp,
	HeadbaseCorePlugin,
	ApplicationAPI,
	VaultsAPIContext, WorkspacePluginItem, FileEditor,
	WorkspaceVaultAPIContext, ApplicationAPIContext, FileExplorer, FileTreeItem, VaultManager, VaultsList, VaultForm,
	CreateVault, EditVault, DeleteVault, VaultMenu, Workspace, WorkspaceAPIContext,
	WelcomePage, AppPage, ManageVaultsPage,
	WorkspaceAPI,
	ContextProvider, EventsServiceContext,
} from "@headbase-app/lib";

import {DeviceAPI} from "@apis/device/device.api.ts";
import {VaultsAPI} from "@apis/vaults/vaults.api.ts";
import {WorkspaceVaultAPI} from "@apis/workspace-vault/workspace-vault.api.ts";
import {FilesAPI} from "@apis/files/files.api.ts";

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

customElements.define(FileEditor.tag, FileEditor)
customElements.define(FileExplorer.tag, FileExplorer)
customElements.define(FileTreeItem.tag, FileTreeItem)

customElements.define(HeadbaseApp.tag, HeadbaseApp)

customElements.define(Workspace.tag, Workspace)
customElements.define(WorkspacePluginItem.tag, WorkspacePluginItem)


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
		const workspaceAPI = new WorkspaceAPI(eventsService, deviceAPI, filesAPI);
		const applicationAPI = new ApplicationAPI(deviceAPI, filesAPI, workspaceAPI);

		// todo: core plugin should get special registration internally via ApplicationAPI?
		applicationAPI.registerPlugin(HeadbaseCorePlugin);

		this.contextProvider = new ContextProvider(document, "hb-desktop-app")
		// todo: event service should not be directly exposed?
		this.contextProvider.add(EventsServiceContext, eventsService)
		this.contextProvider.add(DeviceAPIContext, deviceAPI)
		this.contextProvider.add(VaultsAPIContext, vaultsAPI)
		this.contextProvider.add(WorkspaceVaultAPIContext, workspaceVaultAPI)
		this.contextProvider.add(FilesAPIContext, filesAPI)
		this.contextProvider.add(WorkspaceAPIContext, workspaceAPI)
		this.contextProvider.add(ApplicationAPIContext, applicationAPI)
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
