import { PlatformInfo } from './patterns/platform-info/platform-info'

import './i18n';

import './styles/reset.css'
import './styles/base.css'
import './styles/theme.css'

import {VaultList} from "@renderer/patterns/vault-list";
import {TitleBar} from "@renderer/patterns/title-bar/title-bar";
import {VaultsProvider} from "@renderer/modules/vaults/vaults.provider";
import {PlatformInfoProvider} from "@renderer/modules/platform-info/vaults.provider";

export function App() {
	return (
		<PlatformInfoProvider>
			<VaultsProvider>
				<TitleBar />
				<PlatformInfo/>
				<VaultList/>
			</VaultsProvider>
		</PlatformInfoProvider>
	)
}
