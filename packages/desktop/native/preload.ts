import { contextBridge, ipcRenderer } from 'electron'

// importing specific file to prevent including web only deps (like pdfjs-dist) in Node.js (see /docs/technical-debt.md)
import {CreateVaultDto, UpdateVaultDto} from "@headbase-app/lib/dist/02-apis/vaults/vault.ts";

import {IPlatformAPI} from "@apis/platform-api.ts";

contextBridge.exposeInMainWorld('platformAPI', {
	// DeviceAPI
	device_getCurrentContext: () => ipcRenderer.invoke('device_getCurrentContext'),
	device_getIdentity: () => ipcRenderer.invoke('device_getIdentity'),
	// VaultAPI
	vaults_selectLocation: () => ipcRenderer.invoke('vaults_selectLocation'),
	vaults_create: (createVaultDto: CreateVaultDto) => ipcRenderer.invoke('vaults_create', createVaultDto),
	vaults_update: (vaultId: string, updateVaultDto: UpdateVaultDto) => ipcRenderer.invoke('vaults_update', vaultId, updateVaultDto),
	vaults_delete: (vaultId: string) => ipcRenderer.invoke('vaults_delete', vaultId),
	vaults_get: (vaultId: string) => ipcRenderer.invoke('vaults_get', vaultId),
	vaults_query: () => ipcRenderer.invoke('vaults_query'),
	// WorkspaceVaultAPI
	workspaceVault_get: () => ipcRenderer.invoke('workspaceVault_get'),
	workspaceVault_close: () => ipcRenderer.invoke('workspaceVault_close'),
	workspaceVault_open: (vaultId: string) => ipcRenderer.invoke('workspaceVault_open', vaultId),
	workspaceVault_openNewContext: (vaultId: string) => ipcRenderer.invoke('workspaceVault_openNewContext', vaultId),
	// FilesAPI
	files_ls: () => ipcRenderer.invoke('files_ls'),
	files_tree: () => ipcRenderer.invoke('files_tree'),
	files_mv: () => ipcRenderer.invoke('files_mv'),
	files_cp: () => ipcRenderer.invoke('files_cp'),
	files_rm: () => ipcRenderer.invoke('files_rm'),
	files_mkdir: () => ipcRenderer.invoke('files_mkdir'),
	files_read: () => ipcRenderer.invoke('files_read'),
	files_readAsText: () => ipcRenderer.invoke('files_readAsText'),
	files_readAsUrl: () => ipcRenderer.invoke('files_readAsUrl'),
	files_write: () => ipcRenderer.invoke('files_write'),
	files_writeText: () => ipcRenderer.invoke('files_writeText'),
} satisfies IPlatformAPI)
