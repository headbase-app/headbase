export interface VersionSnapshot {
	id: string
	deletedAt?: string
}

export interface ItemSnapshot {
	id: string
	type: string
	deletedAt?: string
	latestVersion?: string
	versions: VersionSnapshot[]
}

export interface VaultSnapshot {
	vault: {
		updatedAt: string
	}
	items: ItemSnapshot[]
}
