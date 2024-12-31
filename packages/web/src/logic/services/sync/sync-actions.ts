
// todo: combine with "tableKey" from events?
export const TABLE_KEYS = ["fields", "fieldsVersions", "contentTypes", "contentTypesVersions", "contentItems", "contentItemsVersions", "views", "viewsVersions"] as const
export type TableKey = "fields" | "fieldsVersions" | "contentTypes" | "contentTypesVersions" | "contentItems" | "contentItemsVersions" | "views" | "viewsVersions"

export interface UploadAction {
	type: "upload",
	detail: {
		tableKey: TableKey,
		id: string,
	}
}

export interface DownloadAction {
	type: "download",
	detail: {
		tableKey: TableKey,
		id: string,
	}
}

export interface DeleteLocalAction {
	type: "delete-local",
	detail: {
		tableKey: TableKey,
		id: string,
	}
}

export interface DeleteServerAction {
	type: "delete-server",
	detail: {
		tableKey: TableKey,
		id: string,
	}
}

export interface PurgeAction {
	type: "purge",
	detail: {
		tableKey: TableKey,
		id: string,
	}
}

export type SyncAction = UploadAction | DownloadAction | DeleteLocalAction | DeleteServerAction | PurgeAction;
