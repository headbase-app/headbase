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
	files_ls: (path: string) => ipcRenderer.invoke('files_ls', path),
	files_tree: (path: string) => ipcRenderer.invoke('files_tree', path),
	files_glob: (basePath: string, pattern: string) => ipcRenderer.invoke('files_glob', basePath, pattern),
	files_mv: (sourcePath: string, targetPath: string) => ipcRenderer.invoke('files_mv', sourcePath, targetPath),
	files_cp: (sourcePath: string, targetPath: string) => ipcRenderer.invoke('files_cp', sourcePath, targetPath),
	files_rm: (path: string) => ipcRenderer.invoke('files_rm', path),
	files_mkdir: (path: string) => ipcRenderer.invoke('files_mkdir', path),
	files_read: (path: string) => ipcRenderer.invoke('files_read', path),
	files_readAsText: (path: string) => ipcRenderer.invoke('files_readAsText', path),
	files_readAsUrl: (path: string) => ipcRenderer.invoke('files_readAsUrl', path),
	files_stat: (path: string) => ipcRenderer.invoke('files_stat', path),
	files_write: (path: string, data: ArrayBuffer|Uint8Array) => ipcRenderer.invoke('files_write', path, data),
	files_writeText: (path: string, data: string) => ipcRenderer.invoke('files_writeText', path, data),
} satisfies IPlatformAPI)
