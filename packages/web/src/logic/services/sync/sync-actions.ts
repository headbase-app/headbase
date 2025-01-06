
// todo: combine with "tableKey" from events?
export const TABLE_KEYS = ["fields", "fieldsVersions", "contentTypes", "contentTypesVersions", "contentItems", "contentItemsVersions", "views", "viewsVersions"] as const
export type TableKey = "fields" | "fieldsVersions" | "contentTypes" | "contentTypesVersions" | "contentItems" | "contentItemsVersions" | "views" | "viewsVersions"

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
		tableKey: TableKey,
		id: string,
	}
}

export interface DownloadItemAction {
	type: "item-download",
	detail: {
		databaseId: string,
		tableKey: TableKey,
		id: string,
	}
}

export interface DeleteLocalItemAction {
	type: "item-delete-local",
	detail: {
		databaseId: string,
		tableKey: TableKey,
		id: string,
	}
}

export interface DeleteServerItemAction {
	type: "item-delete-server",
	detail: {
		databaseId: string,
		tableKey: TableKey,
		id: string,
	}
}

export interface PurgeItemAction {
	type: "item-purge",
	detail: {
		databaseId: string,
		tableKey: TableKey,
		id: string,
	}
}

export type SyncAction = SyncDatabaseAction | UploadItemAction | DownloadItemAction | DeleteLocalItemAction | DeleteServerItemAction | PurgeItemAction;
