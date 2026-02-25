import { Environment } from './environment'
import {CreateVaultDto, UpdateVaultDto, LocalVaultDto} from './vaults'
import {FileSystemDirectory} from "../main/file-system/operations";

export type PlatformResponse<T> = {
	error: false,
	result: T
} | {
	error: true,
	identifier: string
	cause: unknown
}

export interface IPlatformAPI {
	// Environment Info
	getEnvironment: () => Promise<PlatformResponse<Environment>>
	// Vaults
	createVault: (createVaultDto: CreateVaultDto) => Promise<PlatformResponse<LocalVaultDto>>
	updateVault: (vaultId: string, updateVaultDto: UpdateVaultDto) => Promise<PlatformResponse<LocalVaultDto>>
	deleteVault: (vaultId: string) => Promise<PlatformResponse<void>>
	getVault: (vaultId: string) => Promise<PlatformResponse<LocalVaultDto |null>>
	getVaults: () => Promise<PlatformResponse<LocalVaultDto[]>>
	getCurrentVault: () => Promise<PlatformResponse<LocalVaultDto | null>>
	closeCurrentVault: () => Promise<PlatformResponse<void>>
	openVault: (vaultId: string) => Promise<PlatformResponse<void>>
	openVaultNewWindow: (vaultId: string) => Promise<PlatformResponse<void>>
	// File System
	filesTree: () => Promise<FileSystemDirectory | null>
}

declare global {
	interface Window {
		platformAPI: IPlatformAPI
	}
}
