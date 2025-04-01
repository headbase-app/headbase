export interface Snapshot {
	[id: string]: boolean
}

export interface VaultSnapshot {
	vault: {
		updatedAt: string
	}
	versions: Snapshot
}
