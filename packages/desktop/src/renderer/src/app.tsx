import { PlatformInfo } from './patterns/platform-info/platform-info'

import './i18n';

import './styles/reset.css'
import './styles/base.css'
import './styles/theme.css'

import {VaultList} from "@renderer/patterns/vault-list";
import {TitleBar} from "@renderer/patterns/title-bar/title-bar";
import {VaultsProvider} from "@renderer/modules/vaults/vaults.provider";
import {PlatformInfoProvider} from "@renderer/modules/platform-info/platform-info.provider";
import {ErrorBoundary} from "react-error-boundary";
import {WebPlatformInfoService} from "@renderer/modules/platform-info/platform-info.service";
import {WebVaultsService} from "@renderer/modules/vaults/vaults.service";
import {useCurrentVault, useVaults} from "@renderer/modules/vaults/vaults.selectors";
import {usePlatformInfo} from "@renderer/modules/platform-info/platform-info.selectors";
import {useVaultsService} from "@renderer/modules/vaults/vaults.context";

const webPlatformInfoService = new WebPlatformInfoService();
const webVaultsService = new WebVaultsService();

export function App() {
	return (
		<PlatformInfoProvider platformInfoService={webPlatformInfoService}>
			<VaultsProvider vaultsService={webVaultsService}>
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
			<PlatformInfo versions={versions} isVersionsLoading={isVersionsLoading}/>
			<VaultList
				vaults={vaults}
				isVaultsLoading={isVaultsLoading}
				currentVault={currentVault}
				isCurrentVaultLoading={isCurrentVaultLoading}
				openVault={vaultsService.openVault}
				openVaultNewWindow={vaultsService.openVaultNewWindow}
			/>
		</ErrorBoundary>
	)
}
