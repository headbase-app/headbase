import {HistoryItemDto} from "../history/history";

export interface Snapshot {
	[id: string]: {
		type: HistoryItemDto["type"],
		path: HistoryItemDto["path"],
		previousVersionId: HistoryItemDto["previousVersionId"],
		deletedAt: HistoryItemDto["deletedAt"],
	}
}

export interface VaultSnapshot {
	vault: {
		updatedAt: string
	}
	items: Snapshot
}
