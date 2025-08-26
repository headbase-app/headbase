import { SystemInfo } from './patterns/system-info'

import './i18n';

import './styles/reset.css'
import './styles/vars.css'
import './styles/base.css'
import {VaultList} from "@renderer/patterns/vault-list";

export function App() {
	return (
		<div>
			<SystemInfo />
			<VaultList />
		</div>
	)
}
