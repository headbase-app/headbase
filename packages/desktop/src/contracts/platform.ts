import { Version } from './version'
import { Vault } from './vaults'

export type PlatformResponse<T> = {
	error: false,
	result: T
} | {
	error: true,
	identifier: string
	cause: unknown
}

export interface IPlatformAPI {
	getOpenVault: () => Promise<PlatformResponse<string | null>>
	switchVault: (vaultId: string) => Promise<PlatformResponse<void>>
	openVaultWindow: (vaultId: string) => Promise<PlatformResponse<void>>
	getVersions: () => Promise<PlatformResponse<Version[]>>
	getVaults: () => Promise<PlatformResponse<Vault[]>>
}

declare global {
	interface Window {
		platformAPI: IPlatformAPI
	}
}
