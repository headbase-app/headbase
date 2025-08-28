import { Version } from './version'
import { Vault } from './vaults'

export interface IPlatformAPI {
	ping: () => Promise<'pong'>
	getVersions: () => Promise<Version[]>
	getVaults: () => Promise<Vault[]>
}

declare global {
	interface Window {
		platformAPI: IPlatformAPI
	}
}
