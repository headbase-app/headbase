import { SystemInfo } from './patterns/system-info'

import './styles/reset.css'
import './styles/vars.css'
import './styles/base.css'

export function App() {
	const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

	return (
		<div>
			<button onClick={ipcHandle}>Send IPC</button>
			<SystemInfo />
		</div>
	)
}
