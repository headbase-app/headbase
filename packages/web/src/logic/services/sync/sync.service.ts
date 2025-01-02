/**
 * - "sync actions" are generated when the user makes changes or changes are received from the server
 * - a "full sync" will compare snapshots from server and client, then generate the "sync actions" required to sync up
 * - sync actions are processed separate to the logic which creates them
 * - sync actions are a set to prevent duplicates
 * - observables can be used to update the FE with the sync status, actions and log.
 *
 * - how are vault and user syncs handled? in the same way?
 * - how does sync work across different browser contexts? one tab uses web lock to declare itself the manager and handles all sync?
 * - how does this service play into local-only clean up and tasks, such as removing old/deleted content?
 * - is relying on events a good structure?
 *
 * - is the sync service also responsible for network requests?
 * need to be able to test if sync actions are created without then relying on api requests
 * how will sync service work when the user is not logged in? needs to handle this gracefully
 *
 */
import {IEventsService} from "../interfaces.ts";
import {DatabaseSnapshot} from "../database/db.ts";
import {SyncAction, TABLE_KEYS} from "./sync-actions.ts";

export type SyncStatus = 'synced' | 'queued' | 'running' | 'error' | 'disabled'

export class SyncService {

	constructor(
		private eventsService: IEventsService
	) {}

	/**
	 * Compare two snapshots and return the actions required to sync them into the same state.
	 *
	 * @param localSnapshot
	 * @param serverSnapshot
	 */
	compareSnapshots(localSnapshot: DatabaseSnapshot, serverSnapshot: DatabaseSnapshot): SyncAction[] {
		const syncActions: SyncAction[] = []

		for (const tableKey of TABLE_KEYS) {
			const localTableSnapshot = localSnapshot[tableKey]
			const localTableIds = Object.keys(localTableSnapshot)
			const serverTableSnapshot = serverSnapshot[tableKey]
			const serverTableIds = Object.keys(serverTableSnapshot)

			// Upload to server if not deleted and if the server doesn't already have the data.
			const toUpload = localTableIds.filter(id => !localTableSnapshot[id] && !serverTableIds.includes(id))
			for (const id of toUpload) {
				syncActions.push({
					type: "upload",
					detail: {
						id: id,
						tableKey
					}
				})
			}

			// Download from server if not deleted and if local doesn't already have the data.
			const toDownload = serverTableIds.filter(id => !serverTableSnapshot[id] && !localTableIds.includes(id))
			for (const id of toDownload) {
				syncActions.push({
					type: "download",
					detail: {
						id: id,
						tableKey
					}
				})
			}

			// Delete from server if deleted locally, and if the server has not yet deleted the data.
			const toServerDelete = localTableIds.filter(id => localTableSnapshot[id] && serverTableSnapshot[id] === false)
			for (const id of toServerDelete) {
				syncActions.push({
					type: "delete-server",
					detail: {
						id: id,
						tableKey
					}
				})
			}

			// Delete locally if the server has deleted but local hasn't yet.
			const toLocalDelete = serverTableIds.filter(id => serverTableSnapshot[id] && localTableSnapshot[id] === false)
			for (const id of toLocalDelete) {
				syncActions.push({
					type: "delete-local",
					detail: {
						id: id,
						tableKey
					}
				})
			}

			// Purge locally if the item is already deleted on both the server and locally
			const toPurge = serverTableIds.filter(id => serverTableSnapshot[id] && localTableSnapshot[id])
			for (const id of toPurge) {
				syncActions.push({
					type: "purge",
					detail: {
						id: id,
						tableKey
					}
				})
			}
		}

		return syncActions;
	}
}
