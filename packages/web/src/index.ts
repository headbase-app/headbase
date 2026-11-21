import { html } from "lit-html";
import * as opfsx from "opfsx"

import {
	BaseElement,
	DeviceAPIContext, HeadbaseApp,
	HeadbaseCorePlugin,
	ApplicationAPI,
	DatabaseManagerAPIContext, WorkspacePluginItem,
	DatabaseSwitcherAPIContext, ApplicationAPIContext, DatabaseManager, DatabaseList, DatabaseForm,
	CreateDatabase, EditDatabase, DeleteDatabase, DatabaseMenu, Workspace, WorkspaceAPIContext,
	WelcomePage, AppPage, ManageDatabasesPage,
	WorkspaceAPI,
	ContextProvider,
	CommonEventsService, EventsServiceContext, MatterDatabaseAPIContext, Search
} from "@headbase-app/lib";

import {DeviceAPI} from "@apis/device/device.api.ts";
import {WebDatabaseManagerAPI} from "@apis/database-manager/database-manager.api.ts";
import {WebDatabaseSwitcherAPI} from "@apis/database-switcher/database-switcher.api.ts";
import {MatterWebProxy} from "@apis/matter-proxy.ts";

import "./index.css"

customElements.define(WelcomePage.tag, WelcomePage)
customElements.define(ManageDatabasesPage.tag, ManageDatabasesPage)
customElements.define(AppPage.tag, AppPage)

customElements.define(DatabaseManager.tag, DatabaseManager)
customElements.define(DatabaseList.tag, DatabaseList)
customElements.define(DatabaseForm.tag, DatabaseForm)
customElements.define(CreateDatabase.tag, CreateDatabase)
customElements.define(EditDatabase.tag, EditDatabase)
customElements.define(DeleteDatabase.tag, DeleteDatabase)

customElements.define(DatabaseMenu.tag, DatabaseMenu)

customElements.define(HeadbaseApp.tag, HeadbaseApp)

customElements.define(Workspace.tag, Workspace)
customElements.define(WorkspacePluginItem.tag, WorkspacePluginItem)

customElements.define(Search.tag, Search)

export class HeadbaseDesktopApp extends BaseElement {
	static tag = 'hb-desktop-app';
	contextProvider: ContextProvider;
	worker: Worker;

	constructor() {
		super();
		const deviceAPI = new DeviceAPI();
		const eventsService = new CommonEventsService(deviceAPI);
		const databaseManagerAPI = new WebDatabaseManagerAPI(eventsService, deviceAPI);
		const databaseSwitcherAPI = new WebDatabaseSwitcherAPI(eventsService, deviceAPI, databaseManagerAPI);
		const workspaceAPI = new WorkspaceAPI(eventsService, deviceAPI);
		const applicationAPI = new ApplicationAPI(deviceAPI, workspaceAPI);

		this.worker = new Worker(new URL('./workers/headbase.ts', import.meta.url), { type: 'module' });
		const matterWebProxy = new MatterWebProxy(this.worker, databaseSwitcherAPI)

		// @ts-ignore --- allows easy debugging of active database
		window.matterProxy = matterWebProxy;
		// @ts-ignore --- allows easy debugging of OPFS
		window.opfsx = opfsx

		// todo: core plugin should get special registration internally via ApplicationAPI?
		applicationAPI.registerPlugin(HeadbaseCorePlugin);

		this.contextProvider = new ContextProvider(document, "hb-desktop-app")
		// todo: event service should not be directly exposed?
		this.contextProvider.add(EventsServiceContext, eventsService)
		this.contextProvider.add(DeviceAPIContext, deviceAPI)
		this.contextProvider.add(DatabaseManagerAPIContext, databaseManagerAPI)
		this.contextProvider.add(DatabaseSwitcherAPIContext, databaseSwitcherAPI)
		this.contextProvider.add(WorkspaceAPIContext, workspaceAPI)
		this.contextProvider.add(ApplicationAPIContext, applicationAPI)
		this.contextProvider.add(MatterDatabaseAPIContext, matterWebProxy)
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
