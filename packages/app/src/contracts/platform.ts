import type { Environment } from './environment'
import {CreateVaultDto, UpdateVaultDto, LocalVaultDto} from './vaults'
import type {FileSystemDirectory} from "@api/files/files.api.ts";
import type {IFileBuffer, IFileStream} from "@api/files/files.interface.ts";

export type PlatformResponse<T> = {
	error: false,
	result: T
} | {
	error: true,
	identifier: string
	cause: unknown
}

// todo: imporve types
type Callback = (event: string, path: string) => void

// todo: ideally these methods would inherit params and return directly from the service methods, for example IDeviceAPI['getEnvironment'].
export interface IPlatformAPI {
	// DeviceAPI
	device_getEnvironment: () => Promise<PlatformResponse<Environment>>
	// VaultsAPI
	vaults_create: (createVaultDto: CreateVaultDto) => Promise<PlatformResponse<LocalVaultDto>>
	vaults_update: (vaultId: string, updateVaultDto: UpdateVaultDto) => Promise<PlatformResponse<LocalVaultDto>>
	vaults_delete: (vaultId: string) => Promise<PlatformResponse<void>>
	vaults_get: (vaultId: string) => Promise<PlatformResponse<LocalVaultDto |null>>
	vaults_query: () => Promise<PlatformResponse<LocalVaultDto[]>>
	// CurrentVaultAPI
	currentVault_get: () => Promise<PlatformResponse<LocalVaultDto | null>>
	currentVault_close: () => Promise<PlatformResponse<void>>
	currentVault_open: (vaultId: string) => Promise<PlatformResponse<void>>
	currentVault_openNewWindow: (vaultId: string) => Promise<PlatformResponse<void>>
	// FilesAPI
	files_tree: () => Promise<PlatformResponse<FileSystemDirectory>>
	files_read: (path: string) => Promise<PlatformResponse<IFileBuffer>>
	files_readStream: (path: string) => Promise<PlatformResponse<IFileStream>>
	files_write: (path: string, buffer: ArrayBuffer) => Promise<PlatformResponse<void>>
	files_open_external: (path: string) => Promise<PlatformResponse<void>>
	files_on_change: (callback: Callback) => void
}

declare global {
	interface Window {
		platformAPI: IPlatformAPI
	}
}
