import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('platformAPI', {
	ping: () => ipcRenderer.invoke('ping'),
	versions: () => ipcRenderer.invoke('versions'),
	loadVaults: () => ipcRenderer.invoke('loadVaults')
})
