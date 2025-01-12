export interface ItemSnapshot {
	id: string
	groupId: string
	previousVersionId: string | null
	type: string
	deletedAt: string | null
}

export interface VaultSnapshot {
	vault: {
		updatedAt: string
	}
	items: ItemSnapshot[]
}
