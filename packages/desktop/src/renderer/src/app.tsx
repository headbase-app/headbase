import './i18n';

import "./styles/tailwind.css"

import { ArrowDown as DownArrowIcon } from "lucide-react"
import {ErrorBoundary} from "react-error-boundary";

import {TitleBar} from "@renderer/patterns/organisms/title-bar/title-bar";
import {VaultsProvider} from "@renderer/services/vaults/vaults.provider";
import {DeviceProvider} from "@renderer/services/device/device.provider";
import {WebDeviceService} from "@renderer/services/device/device.service";
import {WebVaultsService} from "@renderer/services/vaults/vaults.service";
import {EventsService} from "@renderer/services/events/events.service";
import {useCurrentVault, useVaults} from "@renderer/services/vaults/vaults.hooks";
import {useVaultsService} from "@renderer/services/vaults/vaults.context";
import {Tooltip} from "@renderer/patterns/components/tooltip/tooltip";
import {useEnvironment} from "@renderer/services/device/device.selectors";
import {VaultManagerDialog, VaultManagerDialogProvider} from "@renderer/features/vaults/manager/vaults-manager";
import {useVaultManagerDialogContext} from "@renderer/features/vaults/manager/vault-manager-context";
import {SubscriptionResultStatus} from "@renderer/utils/subscriptions";
import {FileSystemExplorer} from "@renderer/features/file-system/file-system-explorer";

const deviceService = new WebDeviceService();
const eventsService = new EventsService(deviceService);
const vaultsService = new WebVaultsService(deviceService, eventsService);

export function App() {
	return (
		<DeviceProvider deviceService={deviceService}>
			<VaultsProvider vaultsService={vaultsService}>
				<VaultManagerDialogProvider>
					<Main />

					<VaultManagerDialog />
				</VaultManagerDialogProvider>
			</VaultsProvider>
		</DeviceProvider>
	)
}

export function Main() {
	const { vaultsService } = useVaultsService()
	const currentVaultQuery = useCurrentVault()
	const { environment, isEnvironmentLoading } = useEnvironment()
	const vaultsQuery = useVaults()

	const { setOpenTab: openVaultManagerTab } = useVaultManagerDialogContext()

	const currentVault = currentVaultQuery.status === SubscriptionResultStatus.SUCCESS ? currentVaultQuery.result : undefined
	const vaults = vaultsQuery.status === SubscriptionResultStatus.SUCCESS ? vaultsQuery.result : []

	return (
		<ErrorBoundary fallback={<p>An error occurred</p>}>
			<TitleBar currentVault={currentVault} />

			<div className="flex h-screen w-screen bg-theme-base-bg pt-[30px]">
				<div className="max-w-[300px] w-full h-full bg-theme-panel-bg relative">

					<div className='absolute w-full top-0 left-0 h-28 bg-theme-panel-bg'>
						<Tooltip content='Manage databases' renderAsChild={true} variant='dark'>
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
					<div className='max-h-[calc(100vh-var(--spacing)*2)] overflow-scroll my-25'>
						<ErrorBoundary fallback={<p>An error occurred</p>}>
							<FileSystemExplorer />
						</ErrorBoundary>
					</div>
					<div className='absolute w-full bottom-0 left-0 h-25 bg-theme-panel-bg '>
						<p>footer</p>
					</div>
				</div>
			</div>
		</ErrorBoundary>
	)
}
