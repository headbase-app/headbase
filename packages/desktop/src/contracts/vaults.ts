export interface Vault {
	id: string
	path: string
	displayName: string
}

export interface VaultMap {
	[vaultId: string]: Vault
}
