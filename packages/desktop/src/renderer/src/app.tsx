import { SystemInfo } from './patterns/system-info'

import './i18n';

import './styles/reset.css'
import './styles/base.css'
import './styles/theme.css'

import {VaultList} from "@renderer/patterns/vault-list";
import {TitleBar} from "@renderer/patterns/title-bar/title-bar";
import {VaultsProvider} from "@renderer/modules/vaults/vaults.provider";

export function App() {
	return (
		<VaultsProvider>
			<TitleBar />
			<SystemInfo/>
			<VaultList/>
		</VaultsProvider>
	)
}
