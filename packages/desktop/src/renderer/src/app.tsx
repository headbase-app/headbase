import { PlatformInfo } from './patterns/platform-info/platform-info'

import './i18n';

import "./styles/tailwind.css"

import {VaultList} from "@renderer/patterns/vault-list";
import {TitleBar} from "@renderer/patterns/title-bar/title-bar";
import {VaultsProvider} from "@renderer/modules/vaults/vaults.provider";
import {PlatformInfoProvider} from "@renderer/modules/platform-info/platform-info.provider";
import {ErrorBoundary} from "react-error-boundary";
import {WebPlatformInfoService} from "@renderer/modules/platform-info/platform-info.service";
import {WebVaultsService} from "@renderer/services/vaults/vaults.service";
import {EventsService} from "@renderer/services/events/events.service";
import {useCurrentVault, useVaults} from "@renderer/modules/vaults/vaults.hooks";
import {usePlatformInfo} from "@renderer/modules/platform-info/platform-info.selectors";
import {useVaultsService} from "@renderer/modules/vaults/vaults.context";
import {WebDeviceService} from "@renderer/services/device/device.service";

const deviceService = new WebDeviceService();
const platformInfoService = new WebPlatformInfoService();
const eventsService = new EventsService(deviceService);
const vaultsService = new WebVaultsService(deviceService, eventsService);

export function App() {
	return (
		<PlatformInfoProvider platformInfoService={platformInfoService}>
			<VaultsProvider vaultsService={vaultsService}>
				<Main />
			</VaultsProvider>
		</PlatformInfoProvider>
	)
}

export function Main() {
	const { vaultsService } = useVaultsService()
	const { currentVault, isCurrentVaultLoading } = useCurrentVault()
	const { versions, isVersionsLoading } = usePlatformInfo()
	const { vaults, isVaultsLoading } = useVaults()

	return (
		<ErrorBoundary fallback={<p>An error occurred</p>}>
			<TitleBar currentVault={currentVault} />

			<div className="flex h-screen w-screen bg-theme-base-bg pt-[30px]">
				<div className="max-w-[300px] w-full h-full bg-theme-panel-bg">

				</div>
				<div className="text-t">
					<PlatformInfo versions={versions} isVersionsLoading={isVersionsLoading}/>
					<VaultList
						vaults={vaults}
						isVaultsLoading={isVaultsLoading}
						currentVault={currentVault}
						isCurrentVaultLoading={isCurrentVaultLoading}
						openVault={vaultsService.openVault.bind(vaultsService)}
						openVaultNewWindow={vaultsService.openVaultNewWindow.bind(vaultsService)}
					/>
				</div>
			</div>
		</ErrorBoundary>
	)
}
