import * as opfsx from "opfsx"
import {Capacitor} from "@capacitor/core";
import {createEffect, from} from "solid-js";
import {Route, createMemoryHistory, MemoryRouter, useNavigate} from "@solidjs/router";

import {CommonVaultsAPI, CommonEventsService, type IFilesAPI} from "@headbase-app/libweb";
import type {IDatabaseService, IDeviceAPI, IEventsService, IVaultsAPI, IWorkspaceVaultAPI} from "@headbase-app/libweb";

import {WebDeviceApi} from "@apis/web/device/web-device.api.ts";
import {WebDatabaseService} from "@apis/web/database/web-database.service.ts";
import {WebWorkspaceVaultAPI} from "@apis/web/workspace-vault/workspace-vault.api.ts";
import MobileDatabaseService from "@apis/mobile/database/mobile-database.service.ts";

import {VaultsServiceContext} from "@framework/vaults.context.ts";
import {CurrentVaultServiceContext, useCurrentVaultService} from "@framework/current-vault.context.ts";
import {WorkspaceProvider} from "@ui/03-features/workspace/workspace.provider.tsx";

import {Workspace} from "@ui/03-features/workspace/workspace.tsx";
import {VaultMenu} from "@ui/03-features/vault-menu/vault-menu.tsx";
import {VaultManager, type VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";
import {WebFilesAPI} from "@apis/web/files/web-files.api.ts";
import {MobileFilesAPI} from "@apis/mobile/files/mobile-files.api.ts";
import {FilesAPIContext, useFilesAPI} from "@framework/files-api.context.ts";
import {VaultManagerDialog} from "@ui/03-features/vault-manager/vault-manager-dialog.tsx";
import {createStore} from "solid-js/store";


let databaseService: IDatabaseService
let deviceAPI: IDeviceAPI;
let eventsService: IEventsService;
let vaultsAPI: IVaultsAPI;
let workspaceVaultAPI: IWorkspaceVaultAPI;
let filesAPI: IFilesAPI

if (Capacitor.getPlatform() === 'web') {
	console.log("[init] Welcome to Headbase, starting as web app")
	databaseService = new WebDatabaseService();
	deviceAPI = new WebDeviceApi();
	eventsService = new CommonEventsService(deviceAPI);
	vaultsAPI = new CommonVaultsAPI(databaseService, deviceAPI, eventsService);
	workspaceVaultAPI = new WebWorkspaceVaultAPI(deviceAPI, eventsService, vaultsAPI);
	filesAPI = new WebFilesAPI()
	// Allows for easier managing/debugging of the OPFS in Firefox where no tools/extensions exist to easily  do this.
	// @ts-ignore --- adding custom property for debugging purposes.
	window.opfsx = opfsx
}
else {
	console.log(`[init] Welcome to Headbase, starting as ${Capacitor.getPlatform()} app`)
	databaseService = new MobileDatabaseService();
	deviceAPI = new WebDeviceApi();
	eventsService = new CommonEventsService(deviceAPI);
	vaultsAPI = new CommonVaultsAPI(databaseService, deviceAPI, eventsService);
	workspaceVaultAPI = new WebWorkspaceVaultAPI(deviceAPI, eventsService, vaultsAPI);
	filesAPI = new MobileFilesAPI()
}

export default function ApplicationWrapper() {
	return (
		<VaultsServiceContext.Provider value={vaultsAPI}>
			<CurrentVaultServiceContext.Provider value={workspaceVaultAPI}>
				<FilesAPIContext.Provider value={filesAPI}>
					<WorkspaceProvider>
						<Application />
					</WorkspaceProvider>
				</FilesAPIContext.Provider>
			</CurrentVaultServiceContext.Provider>
		</VaultsServiceContext.Provider>
  )
}

function Application() {
	const history = createMemoryHistory();
	return (
		<MemoryRouter history={history}>
			<Route path="/" component={SplashPage} />
			<Route path="/welcome" component={() => <p>Welcome</p>} />
			<Route path="/select-vault" component={SelectVaultPage} />
			<Route path='/app' component={MainApplicationPage} />
		</MemoryRouter>
	)
}

// todo: navigate to welcome journey on first visit?
function useVaultRedirects() {
	const navigate = useNavigate()

	const currentVaultService = useCurrentVaultService()

	const openVaultQuery = from(currentVaultService.liveGet())
	createEffect(() => {
		const query = openVaultQuery()
		if (query?.status === 'success') {
			navigate(query.result ? "/app" : "/select-vault")
		}
	})
}

function SplashPage() {
	useVaultRedirects()

	return (
		<div>
			<h1>Splash</h1>
		</div>
	)
}

function SelectVaultPage() {
	useVaultRedirects()
	const [page, setPage] = createStore<VaultManagerPage>({type: "list"})

	return (
		<div>
			<h1>Select Vault</h1>
			<VaultManager page={page} setPage={setPage} />
		</div>
	)
}

function MainApplicationPage() {
	useVaultRedirects()
	const filesAPI = useFilesAPI()

	createEffect(async () => {
		const isFilePermissionGranted = await filesAPI.checkPermissions()
		if (!isFilePermissionGranted) {
			console.debug(`[init] File permissions check failed, requesting permissions`)
			await filesAPI.requestPermissions()
		}
		else {
			console.debug("[init] File permissions check succeeded")
		}
	})

	return (
		<>
			<div>
				<VaultMenu />
				<VaultManagerDialog />
			</div>
			<hr />
			<div>
				<Workspace />
			</div>
		</>
	)
}
