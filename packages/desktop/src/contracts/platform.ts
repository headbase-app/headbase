import { Version } from './version'
import {Vault, VaultMap} from './vaults'

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
	getVaults: () => Promise<PlatformResponse<VaultMap>>
	getCurrentVault: () => Promise<PlatformResponse<Vault | null>>
	openVault: (vaultId: string) => Promise<PlatformResponse<void>>
	openVaultNewWindow: (vaultId: string) => Promise<PlatformResponse<void>>
}

declare global {
	interface Window {
		platformAPI: IPlatformAPI
	}
}
