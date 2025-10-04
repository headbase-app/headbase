import './i18n';
import "./styles/tailwind.css"

import { ArrowDown as DownArrowIcon } from "lucide-react"
import {ErrorBoundary} from "react-error-boundary";

import {TitleBar} from "@ui/03-organisms/title-bar/title-bar";
import {DeviceAPI} from "@api/device/device.api";
import {VaultsAPI} from "@api/vaults/vaults.api";
import {EventsAPI} from "@api/events/events.api";
import {Tooltip} from "@ui/02-components/tooltip/tooltip";
import {VaultManagerDialog, VaultManagerDialogProvider} from "@ui/04-features/vaults/manager/vaults-manager";
import {useVaultManagerDialogContext} from "@ui/04-features/vaults/manager/vault-manager-context";
import {FileSystemExplorer} from "@ui/04-features/file-system/file-system-explorer";
import {DependencyProvider} from "@framework/dependency.provider";
import {useCurrentVault} from "@framework/hooks/use-current-vault";
import {CurrentVaultAPI} from "@api/current-vault/current-vault.api";
import {LiveQueryStatus} from "@contracts/query";
import {FilesAPI} from "@api/files/files.api";

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
				<Main />
				<VaultManagerDialog />
			</VaultManagerDialogProvider>
		</DependencyProvider>
	)
}

export function Main() {
	const currentVaultQuery = useCurrentVault()

	const { setOpenTab: openVaultManagerTab } = useVaultManagerDialogContext()

	const currentVault = currentVaultQuery.status === LiveQueryStatus.SUCCESS ? currentVaultQuery.result : undefined
	return (
		<ErrorBoundary fallback={<p>An error occurred</p>}>
			<TitleBar currentVault={currentVault} />

			<div className="flex h-screen w-screen bg-theme-base-bg pt-[30px]">
				<div className="max-w-[300px] w-full h-full bg-theme-panel-bg relative">

					<div className='absolute w-full top-0 left-0 h-25 bg-theme-panel-bg border-b-2 border-b-navy-50'>
						<Tooltip content='Manage databases' renderAsChild={true} variant='dark' preferredPosition='bottom'>
							<button
								className="flex p-4 m-4 hover:bg-navy-50 rounded-md hover:cursor-pointer"
								onClick={() => {
									openVaultManagerTab({type: 'list'})
								}}
							>
								<span tabIndex={-1}>{currentVault ? currentVault.displayName : 'Select Vault'}</span>
								{currentVault && <DownArrowIcon width={2} />}
							</button>
						</Tooltip>
					</div>
					<div className='max-h-[calc(100vh-30px-56px-56px)] overflow-scroll my-25'>
						<ErrorBoundary fallback={<p>An error occurred</p>}>
							<FileSystemExplorer />
						</ErrorBoundary>
					</div>
					<div className='absolute w-full bottom-0 left-0 h-25 bg-theme-panel-bg border-t-2 border-t-navy-50'>
						<p>footer</p>
					</div>
				</div>
			</div>
		</ErrorBoundary>
	)
}
