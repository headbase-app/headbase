import { contextBridge, ipcRenderer } from 'electron'
import {CreateVaultDto, UpdateVaultDto} from "../contracts/vaults";
import {IPlatformAPI} from "../contracts/platform";
import {IFileBufferWrite} from "../renderer/src/api/files/files.interface";

contextBridge.exposeInMainWorld('platformAPI', {
	// DeviceAPI
	device_getEnvironment: () => ipcRenderer.invoke('device_getEnvironment'),
	// VaultsAPI
	vaults_create: (createVaultDto: CreateVaultDto) => ipcRenderer.invoke('vaults_create', createVaultDto),
	vaults_update: (vaultId: string, updateVaultDto: UpdateVaultDto) => ipcRenderer.invoke('vaults_update', vaultId, updateVaultDto),
	vaults_delete: (vaultId: string) => ipcRenderer.invoke('vaults_delete', vaultId),
	vaults_get: (vaultId: string) => ipcRenderer.invoke('vaults_get', vaultId),
	vaults_query: () => ipcRenderer.invoke('vaults_query'),
	// CurrentVaultAPI
	currentVault_get: () => ipcRenderer.invoke('currentVault_get'),
	currentVault_close: () => ipcRenderer.invoke('currentVault_close'),
	currentVault_open: (vaultId: string) => ipcRenderer.invoke('currentVault_open', vaultId),
	currentVault_openNewWindow: (vaultId: string) => ipcRenderer.invoke('currentVault_openNewWindow', vaultId),
	// FilesAPI
	files_tree: () => ipcRenderer.invoke('files_tree'),
	files_read: (path: string) => ipcRenderer.invoke('files_read', path),
	files_readStream: (path: string) => ipcRenderer.invoke('files_readStream', path),
	files_write: (path: string, file: IFileBufferWrite) => ipcRenderer.invoke('files_write', path, file),
} satisfies IPlatformAPI)
