import { Version } from './version'
import {CreateVaultDto, UpdateVaultDto, Vault} from './vaults'

export type PlatformResponse<T> = {
	error: false,
	result: T
} | {
	error: true,
	identifier: string
	cause: unknown
}

export interface IPlatformAPI {
	// Platform Info
	getVersions: () => Promise<PlatformResponse<Version[]>>
	// Vaults
	createVault: (createVaultDto: CreateVaultDto) => Promise<PlatformResponse<Vault>>
	updateVault: (vaultId: string, updateVaultDto: UpdateVaultDto) => Promise<PlatformResponse<Vault>>
	deleteVault: (vaultId: string) => Promise<PlatformResponse<void>>
	getVault: (vaultId: string) => Promise<PlatformResponse<Vault |null>>
	getVaults: () => Promise<PlatformResponse<Vault[]>>
	getCurrentVault: () => Promise<PlatformResponse<Vault | null>>
	openVault: (vaultId: string) => Promise<PlatformResponse<void>>
	openVaultNewWindow: (vaultId: string) => Promise<PlatformResponse<void>>
}

declare global {
	interface Window {
		platformAPI: IPlatformAPI
	}
}
