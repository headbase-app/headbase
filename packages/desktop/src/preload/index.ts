import { contextBridge, ipcRenderer } from 'electron'
import {CreateVaultDto, UpdateVaultDto} from "../contracts/vaults";

contextBridge.exposeInMainWorld('platformAPI', {
	// Environment
	getEnvironment: () => ipcRenderer.invoke('getEnvironment'),
	// Vaults
	createVault: (createVaultDto: CreateVaultDto) => ipcRenderer.invoke('createVault', createVaultDto),
	updateVault: (vaultId: string, updateVaultDto: UpdateVaultDto) => ipcRenderer.invoke('updateVault', vaultId, updateVaultDto),
	deleteVault: (vaultId: string) => ipcRenderer.invoke('deleteVault', vaultId),
	getVault: (vaultId: string) => ipcRenderer.invoke('getVault', vaultId),
	getVaults: () => ipcRenderer.invoke('getVaults'),
	getCurrentVault: () => ipcRenderer.invoke('getCurrentVault'),
	closeCurrentVault: () => ipcRenderer.invoke('closeCurrentVault'),
	openVault: (vaultId: string) => ipcRenderer.invoke('openVault', vaultId),
	openVaultNewWindow: (vaultId: string) => ipcRenderer.invoke('openVaultNewWindow', vaultId),
	// File System
	fileSystemTree: () => ipcRenderer.invoke('fileSystemTree'),
})
