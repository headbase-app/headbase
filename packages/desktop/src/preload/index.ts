import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('platformAPI', {
	// Versions
	getVersions: () => ipcRenderer.invoke('getVersions'),
	// Vaults
	createVault: () => ipcRenderer.invoke('createVault'),
	updateVault: () => ipcRenderer.invoke('updateVault'),
	deleteVault: () => ipcRenderer.invoke('deleteVault'),
	getVault: () => ipcRenderer.invoke('getVault'),
	getVaults: () => ipcRenderer.invoke('getVaults'),
	getCurrentVault: () => ipcRenderer.invoke('getCurrentVault'),
	openVault: (vaultId: string) => ipcRenderer.invoke('openVault', vaultId),
	openVaultNewWindow: (vaultId: string) => ipcRenderer.invoke('openVaultNewWindow', vaultId),
})
