
// todo: combine with "tableKey" from events?
export const ITEM_TABLE_KEYS = ["fields", "contentTypes", "contentItems", "views"] as const
export type ItemTableKey = "fields" | "contentTypes" | "contentItems" | "views"

export const VERSION_TABLE_KEYS = ["fieldsVersions", "contentTypesVersions", "contentItemsVersions", "viewsVersions"] as const
export type VersionTableKey = "fieldsVersions" | "contentTypesVersions" | "contentItemsVersions" | "viewsVersions"

export interface SyncDatabaseAction {
	type: "sync-database",
	detail: {
		databaseId: string
	}
}

export interface UploadItemAction {
	type: "item-upload",
	detail: {
		databaseId: string,
		tableKey: ItemTableKey,
		id: string,
	}
}

export interface DownloadItemAction {
	type: "item-download",
	detail: {
		databaseId: string,
		tableKey: ItemTableKey,
		id: string,
	}
}

export interface DeleteLocalItemAction {
	type: "item-delete-local",
	detail: {
		databaseId: string,
		tableKey: ItemTableKey,
		id: string,
	}
}

export interface DeleteServerItemAction {
	type: "item-delete-server",
	detail: {
		databaseId: string,
		tableKey: ItemTableKey,
		id: string,
	}
}

export interface PurgeItemAction {
	type: "item-purge",
	detail: {
		databaseId: string,
		tableKey: ItemTableKey,
		id: string,
	}
}

export interface UploadVersionAction {
	type: "version-upload",
	detail: {
		databaseId: string,
		tableKey: VersionTableKey,
		id: string,
	}
}

export interface DownloadVersionAction {
	type: "version-download",
	detail: {
		databaseId: string,
		tableKey: VersionTableKey,
		id: string,
	}
}

export interface DeleteLocalVersionAction {
	type: "version-delete-local",
	detail: {
		databaseId: string,
		tableKey: VersionTableKey,
		id: string,
	}
}

export interface DeleteServerVersionAction {
	type: "version-delete-server",
	detail: {
		databaseId: string,
		tableKey: VersionTableKey,
		id: string,
	}
}

export interface PurgeVersionAction {
	type: "version-purge",
	detail: {
		databaseId: string,
		tableKey: VersionTableKey,
		id: string,
	}
}


export type SyncAction =
	SyncDatabaseAction |
	UploadItemAction | DownloadItemAction | DeleteLocalItemAction | DeleteServerItemAction | PurgeItemAction |
	UploadVersionAction | DownloadVersionAction | DeleteLocalVersionAction | DeleteServerVersionAction | PurgeVersionAction;
