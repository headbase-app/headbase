import {SyncAction} from "./sync-actions.ts";
import {Snapshot} from "@headbase-app/common";


/**
 * Compare two snapshots and return the actions required to sync them into the same state.
 *
 * @param databaseId
 * @param localSnapshot
 * @param serverSnapshot
 */
export function compareSnapshots(databaseId: string, localSnapshot: Snapshot, serverSnapshot: Snapshot): SyncAction[] {
	const syncActions: SyncAction[] = []
	const localIds = Object.keys(localSnapshot)
	const serverIds = Object.keys(serverSnapshot)

	// Upload to server if not deleted and if the server doesn't already have the data.
	const uploads = localIds.filter(id => !localSnapshot[id] && typeof serverSnapshot[id] === "undefined")
	for (const id of uploads) {
		syncActions.push({
			type: "upload",
			detail: {
				databaseId,
				id: id,
			}
		})
	}

	// Download from server if not deleted and if local doesn't already have the data.
	const downloads = serverIds.filter(id => !serverSnapshot[id] && typeof localSnapshot[id] === "undefined")
	for (const id of downloads) {
		syncActions.push({
			type: "download",
			detail: {
				databaseId,
				id: id
			}
		})
	}

	// Delete from server if deleted locally, and if the server has not yet deleted the data.
	const serverDeletions = localIds.filter(id => localSnapshot[id] && serverSnapshot[id] === false)
	for (const id of serverDeletions) {
		syncActions.push({
			type: "delete-server",
			detail: {
				databaseId,
				id: id
			}
		})
	}

	// Delete locally if the server has deleted but local hasn't yet.
	const localDeletions = serverIds.filter(id => serverSnapshot[id] && localSnapshot[id] === false)
	for (const id of localDeletions) {
		syncActions.push({
			type: "delete-local",
			detail: {
				databaseId,
				id: id
			}
		})
	}

	// Purge locally if the item is already deleted on both the server and locally
	const toPurge = serverIds.filter(id => serverSnapshot[id] && localSnapshot[id])
	for (const id of toPurge) {
		syncActions.push({
			type: "purge",
			detail: {
				databaseId,
				id: id
			}
		})
	}

	return syncActions;
}