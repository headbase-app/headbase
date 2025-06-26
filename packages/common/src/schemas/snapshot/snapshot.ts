import {DocumentDto} from "../documents/document";

export interface Snapshot {
	[id: string]: {
		type: DocumentDto["type"],
		id: DocumentDto["id"],
		versionId: DocumentDto["versionId"],
		previousVersionId: DocumentDto["previousVersionId"],
		deletedAt: DocumentDto["deletedAt"],
	}
}

export interface VaultSnapshot {
	vault: {
		updatedAt: string
	}
	items: Snapshot
}
