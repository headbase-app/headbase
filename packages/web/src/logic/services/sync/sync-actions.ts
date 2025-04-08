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

export type SyncAction = UploadAction | DownloadAction | DeleteLocalAction | DeleteServerAction;
