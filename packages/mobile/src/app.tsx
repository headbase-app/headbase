import * as opfsx from "opfsx"
import {Capacitor} from "@capacitor/core";

import {CommonVaultsAPI, CommonEventsService, type IFilesAPI} from "@headbase-app/libweb";
import type {IDatabaseService, IDeviceAPI, IEventsService, IVaultsAPI, IWorkspaceVaultAPI} from "@headbase-app/libweb";

import {WebDeviceApi} from "@apis/web/device/web-device.api.ts";
import {WebDatabaseService} from "@apis/web/database/web-database.service.ts";
import {WebWorkspaceVaultAPI} from "@apis/web/workspace-vault/workspace-vault.api.ts";
import MobileDatabaseService from "@apis/mobile/database/mobile-database.service.ts";

import {VaultsServiceContext} from "@framework/vaults.context.ts";
import {CurrentVaultServiceContext} from "@framework/current-vault.context.ts";
import {WorkspaceProvider} from "@ui/03-features/workspace/workspace.provider.tsx";

import {Workspace} from "@ui/03-features/workspace/workspace.tsx";
import {VaultMenu} from "@ui/03-features/vault-menu/vault-menu.tsx";
import {VaultManager} from "@ui/03-features/vault-manager/vault-manager.tsx";
import {WebFilesAPI} from "@apis/web/files/web-files.api.ts";
import {MobileFilesAPI} from "@apis/mobile/files/mobile-files.api.ts";
import {FilesAPIContext, useFilesAPI} from "@framework/files-api.context.ts";
import {FileExplorer} from "@ui/03-features/file-explorer/file-explorer.tsx";
import {createEffect} from "solid-js";

let databaseService: IDatabaseService
let deviceAPI: IDeviceAPI;
let eventsService: IEventsService;
let vaultsAPI: IVaultsAPI;
let workspaceVaultAPI: IWorkspaceVaultAPI;
let filesAPI: IFilesAPI

if (Capacitor.getPlatform() === 'web') {
	console.log("[start] Welcome to Headbase, starting as web app")
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
	console.log(`[start] Welcome to Headbase, starting as ${Capacitor.getPlatform()} app`)
	databaseService = new MobileDatabaseService();
	deviceAPI = new WebDeviceApi();
	eventsService = new CommonEventsService(deviceAPI);
	vaultsAPI = new CommonVaultsAPI(databaseService, deviceAPI, eventsService);
	workspaceVaultAPI = new WebWorkspaceVaultAPI(deviceAPI, eventsService, vaultsAPI);
	filesAPI = new MobileFilesAPI()
}

export function App() {
	return (
		<VaultsServiceContext.Provider value={vaultsAPI}>
			<CurrentVaultServiceContext.Provider value={workspaceVaultAPI}>
				<FilesAPIContext.Provider value={filesAPI}>
					<WorkspaceProvider>
						<MainPage />
					</WorkspaceProvider>
				</FilesAPIContext.Provider>
			</CurrentVaultServiceContext.Provider>
		</VaultsServiceContext.Provider>
  )
}

function MainPage() {
	function reload() {
		window.location.reload()
	}

	const filesAPI = useFilesAPI()
	createEffect(async () => {
		const isFilePermissionGranted = await filesAPI.checkPermissions()
		console.debug("checkPermissions", isFilePermissionGranted)
		if (!isFilePermissionGranted) {
			console.debug("requestPermissions")
			await filesAPI.requestPermissions()
		}
	})

	return (
		<>
			<div>
				<VaultMenu />
				<button onClick={reload}>reload</button>
				<VaultManager />
				<hr />
				<FileExplorer />
			</div>
			<hr />
			<div>
				<Workspace />
			</div>
		</>
	)
}
