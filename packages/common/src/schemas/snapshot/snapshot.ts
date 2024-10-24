export interface VersionSnapshot {
	id: string
	deletedAt?: string
}

export interface ItemSnapshot {
	id: string
	type: string
	deletedAt?: string
	latestVersion?: string
	versions?: VersionSnapshot[]
}

export type VaultSnapshot = {
	meta: {
		items: number;
		itemsDeleted: number
	}
	results: ItemSnapshot[]
}
