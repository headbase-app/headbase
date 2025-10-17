import './i18n';
import "./styles/tailwind.css"

import {ErrorBoundary} from "react-error-boundary";

import {TitleBar} from "@ui/03-organisms/title-bar/title-bar";
import {DeviceAPI} from "@api/device/device.api";
import {VaultsAPI} from "@api/vaults/vaults.api";
import {EventsAPI} from "@api/events/events.api";
import {VaultManagerDialog, VaultManagerDialogProvider} from "@ui/04-features/vaults/manager/vaults-manager";
import {DependencyProvider} from "@framework/dependency.provider";
import {useCurrentVault} from "@framework/hooks/use-current-vault";
import {CurrentVaultAPI} from "@api/current-vault/current-vault.api";
import {LiveQueryStatus} from "@contracts/query";
import {FilesAPI} from "@api/files/files.api";
import {MenuPanel} from "@ui/04-features/menu-panel/menu-panel";
import {useState} from "react";
import {Workspace} from "@ui/04-features/workspace/workspace";
import {WorkspaceProvider} from "@ui/04-features/workspace/framework/workspace.provider";

const deviceApi = new DeviceAPI();
const eventsApi = new EventsAPI(deviceApi);
const vaultsApi = new VaultsAPI(deviceApi, eventsApi);
const currentVaultApi = new CurrentVaultAPI(deviceApi, eventsApi);
const filesApi = new FilesAPI(eventsApi);

export function App() {
	return (
		<DependencyProvider
			deviceApi={deviceApi}
			eventsApi={eventsApi}
			vaultsApi={vaultsApi}
			currentVaultApi={currentVaultApi}
			filesApi={filesApi}
		>
			<VaultManagerDialogProvider>
				<WorkspaceProvider>
					<Main />
					<VaultManagerDialog />
				</WorkspaceProvider>
			</VaultManagerDialogProvider>
		</DependencyProvider>
	)
}

export function Main() {
	const currentVaultQuery = useCurrentVault()
	const currentVault = currentVaultQuery.status === LiveQueryStatus.SUCCESS ? currentVaultQuery.result : undefined

	const [isMenuPanelOpen, setIsMenuPanelOpen] = useState(true);
	return (
		<ErrorBoundary fallback={<p>An error occurred</p>}>
			<TitleBar currentVault={currentVault} />

			<div className="flex h-screen w-screen bg-theme-base-bg pt-[30px]">
				<MenuPanel
					isMenuPanelOpen={isMenuPanelOpen}
					setIsMenuPanelOpen={setIsMenuPanelOpen}
				/>
				<Workspace
					isMenuPanelOpen={isMenuPanelOpen}
					setIsMenuPanelOpen={setIsMenuPanelOpen}
				/>
			</div>
		</ErrorBoundary>
	)
}
