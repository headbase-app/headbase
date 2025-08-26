import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('platformAPI', {
	getVersions: () => ipcRenderer.invoke('getVersions'),
	getVaults: () => ipcRenderer.invoke('getVaults')
})
