import { Version } from './version'
import { Vault } from './vaults'

export interface IPlatformAPI {
	ping: () => Promise<'ping'>
	versions: () => Promise<Version[]>
	loadVaults: () => Promise<Vault[]>
}

declare global {
	interface Window {
		platformAPI: IPlatformAPI
	}
}
