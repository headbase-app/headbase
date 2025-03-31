
export interface UploadDatabaseAction {
	type: "upload-database",
	detail: {
		databaseId: string
	}
}

export interface DownloadDatabaseAction {
	type: "download-database",
	detail: {
		databaseId: string
	}
}

export interface UploadAction {
	type: "upload",
	detail: {
		databaseId: string,
		id: string,
	}
}

export interface DownloadAction {
	type: "download",
	detail: {
		databaseId: string,
		id: string,
	}
}

export interface DeleteLocalAction {
	type: "delete-local",
	detail: {
		databaseId: string,
		id: string,
	}
}

export interface DeleteServerAction {
	type: "delete-server",
	detail: {
		databaseId: string,
		id: string,
	}
}

export interface PurgeAction {
	type: "purge",
	detail: {
		databaseId: string,
		id: string,
	}
}

export type SyncAction =
	UploadDatabaseAction | DownloadDatabaseAction |
	UploadAction | DownloadAction | DeleteLocalAction | DeleteServerAction | PurgeAction;
