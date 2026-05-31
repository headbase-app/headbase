import {createEffect, from} from "solid-js";
import {Route, createMemoryHistory, MemoryRouter, useNavigate} from "@solidjs/router";
import {createStore} from "solid-js/store";

import {
	WorkspaceProvider, Workspace,
	VaultsAPIContext, WorkspaceVaultAPIContext, FilesAPIContext, DeviceAPIContext, PluginAPIContext,
	useWorkspaceVaultAPI, VaultManager,
	VaultMenu, VaultManagerDialog, type VaultManagerPage, useVaultsAPI
} from "@headbase-app/lib";
import {InjectedDependencies} from "./headbase.ts";


export default function ApplicationWrapper(props: InjectedDependencies) {
	return (
		<VaultsAPIContext.Provider value={props.vaultsAPI}>
			<WorkspaceVaultAPIContext.Provider value={props.workspaceVaultAPI}>
				<FilesAPIContext.Provider value={props.filesAPI}>
					<DeviceAPIContext.Provider value={props.deviceAPI}>
						<PluginAPIContext.Provider value={props.pluginStore}>
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
	const vaultsAPI = useVaultsAPI()

	createEffect(async () => {
		const isFilePermissionGranted = await vaultsAPI.checkPermissions()
		if (!isFilePermissionGranted) {
			console.debug(`[init] File permissions check failed, requesting permissions`)
			await vaultsAPI.requestPermissions()
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
