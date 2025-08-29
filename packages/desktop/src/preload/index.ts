import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('platformAPI', {
	getOpenVault: () => ipcRenderer.invoke('getOpenVault'),
	switchVault: (vaultId: string) => ipcRenderer.invoke('switchVault', vaultId),
	openVaultWindow: (vaultId: string) => ipcRenderer.invoke('openVaultWindow', vaultId),
	getVersions: () => ipcRenderer.invoke('getVersions'),
	getVaults: () => ipcRenderer.invoke('getVaults')
})
