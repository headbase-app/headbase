import {createEffect, from} from "solid-js";
import {Route, createMemoryHistory, MemoryRouter, useNavigate} from "@solidjs/router";
import {createStore} from "solid-js/store";

import {
	CommonEventsService,
	CommonPluginAPI,
	WorkspaceProvider,
	Workspace,
	HeadbaseCorePlugin,
	VaultsAPIContext,
	WorkspaceVaultAPIContext,
	FilesAPIContext,
	DeviceAPIContext,
	PluginAPIContext, useWorkspaceVaultAPI, type VaultManagerPage, VaultManager, useFilesAPI, VaultMenu,
	VaultManagerDialog
} from "@headbase-app/lib";

import {MobileDeviceApi} from "@apis/device/mobile-device.api.ts";
import {MobileFilesAPI} from "@apis/files/mobile-files.api.ts";
import {MobileVaultsAPI} from "@apis/vaults/mobile-vaults.api.ts";
import {MobileWorkspaceVaultAPI} from "@apis/workspace-vault/mobile-workspace-vault.api.ts";

import "./app.css"

const deviceAPI = new MobileDeviceApi();
const eventsService = new CommonEventsService(deviceAPI);
const vaultsAPI = new MobileVaultsAPI(deviceAPI, eventsService);
const workspaceVaultAPI = new MobileWorkspaceVaultAPI(deviceAPI, eventsService, vaultsAPI);
const filesAPI = new MobileFilesAPI()
const pluginAPI = new CommonPluginAPI()
pluginAPI.registerPlugin(HeadbaseCorePlugin)

export default function ApplicationWrapper() {
	return (
		<VaultsAPIContext.Provider value={vaultsAPI}>
			<WorkspaceVaultAPIContext.Provider value={workspaceVaultAPI}>
				<FilesAPIContext.Provider value={filesAPI}>
					<DeviceAPIContext.Provider value={deviceAPI}>
						<PluginAPIContext.Provider value={pluginAPI}>
							<WorkspaceProvider>
								<Application />
							</WorkspaceProvider>
						</PluginAPIContext.Provider>
					</DeviceAPIContext.Provider>
				</FilesAPIContext.Provider>
			</WorkspaceVaultAPIContext.Provider>
		</VaultsAPIContext.Provider>
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

	const currentVaultService = useWorkspaceVaultAPI()

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
