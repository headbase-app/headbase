export interface UploadAction {
	type: "upload",
	detail: {
		vaultId: string,
		id: string,
	}
}

export interface DownloadAction {
	type: "download",
	detail: {
		vaultId: string,
		id: string,
	}
}

export interface DeleteLocalAction {
	type: "delete-local",
	detail: {
		vaultId: string,
		id: string,
	}
}

export interface DeleteServerAction {
	type: "delete-server",
	detail: {
		vaultId: string,
		id: string,
	}
}

export type SyncAction = UploadAction | DownloadAction | DeleteLocalAction | DeleteServerAction;
