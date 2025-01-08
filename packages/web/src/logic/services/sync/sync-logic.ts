import {VaultSnapshot} from "@headbase-app/common";
import {DatabaseSnapshot, TableSnapshot} from "../database/db.ts";
import {ITEM_TABLE_KEYS, SyncAction, VERSION_TABLE_KEYS} from "./sync-actions.ts";

export function convertServerSnapshot(serverSnapshot: VaultSnapshot): DatabaseSnapshot {
	const snapshot: DatabaseSnapshot = {
		fields: {},
		fieldsVersions: {},
		contentTypes: {},
		contentTypesVersions: {},
		contentItems: {},
		contentItemsVersions: {},
		views: {},
		viewsVersions: {},
	}

	for (const item of serverSnapshot.items) {
		const entityTable: TableSnapshot = {}
		const versionsTable: TableSnapshot = {}

		entityTable[item.id] = !!item.deletedAt

		for (const version of item.versions) {
			versionsTable[version.id] = !!version.deletedAt
		}

		if (item.type === 'fields') {
			snapshot.fields = entityTable
			snapshot.fieldsVersions = versionsTable
		}
		else if (item.type === 'contentTypes') {
			snapshot.contentTypes = entityTable
			snapshot.contentTypesVersions = versionsTable
		}
		else if (item.type === 'contentItems') {
			snapshot.contentItems = entityTable
			snapshot.contentItemsVersions = versionsTable
		}
		else if (item.type === 'views') {
			snapshot.views = entityTable
			snapshot.viewsVersions = versionsTable
		}
		else {
			console.error(`server data included unknown item type ${item.type}, ignoring.`)
		}
	}

	return snapshot
}

/**
 * Compare two snapshots and return the actions required to sync them into the same state.
 *
 * @param databaseId
 * @param localSnapshot
 * @param serverSnapshot
 */
export function compareSnapshots(databaseId: string, localSnapshot: DatabaseSnapshot, serverSnapshot: DatabaseSnapshot): SyncAction[] {
	const syncActions: SyncAction[] = []

	for (const tableKey of ITEM_TABLE_KEYS) {
		const localTableSnapshot = localSnapshot[tableKey]
		const localTableIds = Object.keys(localTableSnapshot)
		const serverTableSnapshot = serverSnapshot[tableKey]
		const serverTableIds = Object.keys(serverTableSnapshot)

		// Upload to server if not deleted and if the server doesn't already have the data.
		const toUpload = localTableIds.filter(id => !localTableSnapshot[id] && !serverTableIds.includes(id))
		for (const id of toUpload) {
			syncActions.push({
				type: "item-upload",
				detail: {
					databaseId,
					tableKey,
					id: id,
				}
			})
		}

		// Download from server if not deleted and if local doesn't already have the data.
		const toDownload = serverTableIds.filter(id => !serverTableSnapshot[id] && !localTableIds.includes(id))
		for (const id of toDownload) {
			syncActions.push({
				type: "item-download",
				detail: {
					databaseId,
					tableKey,
					id: id
				}
			})
		}

		// Delete from server if deleted locally, and if the server has not yet deleted the data.
		const toServerDelete = localTableIds.filter(id => localTableSnapshot[id] && serverTableSnapshot[id] === false)
		for (const id of toServerDelete) {
			syncActions.push({
				type: "item-delete-server",
				detail: {
					databaseId,
					tableKey,
					id: id
				}
			})
		}

		// Delete locally if the server has deleted but local hasn't yet.
		const toLocalDelete = serverTableIds.filter(id => serverTableSnapshot[id] && localTableSnapshot[id] === false)
		for (const id of toLocalDelete) {
			syncActions.push({
				type: "item-delete-local",
				detail: {
					databaseId,
					tableKey,
					id: id
				}
			})
		}

		// Purge locally if the item is already deleted on both the server and locally
		const toPurge = serverTableIds.filter(id => serverTableSnapshot[id] && localTableSnapshot[id])
		for (const id of toPurge) {
			syncActions.push({
				type: "item-purge",
				detail: {
					databaseId,
					tableKey,
					id: id
				}
			})
		}
	}

	for (const tableKey of VERSION_TABLE_KEYS) {
		const localTableSnapshot = localSnapshot[tableKey]
		const localTableIds = Object.keys(localTableSnapshot)
		const serverTableSnapshot = serverSnapshot[tableKey]
		const serverTableIds = Object.keys(serverTableSnapshot)

		// Upload to server if not deleted and if the server doesn't already have the data.
		const toUpload = localTableIds.filter(id => !localTableSnapshot[id] && !serverTableIds.includes(id))
		for (const id of toUpload) {
			syncActions.push({
				type: "version-upload",
				detail: {
					databaseId,
					tableKey,
					id: id,
				}
			})
		}

		// Download from server if not deleted and if local doesn't already have the data.
		const toDownload = serverTableIds.filter(id => !serverTableSnapshot[id] && !localTableIds.includes(id))
		for (const id of toDownload) {
			syncActions.push({
				type: "version-download",
				detail: {
					databaseId,
					tableKey,
					id: id
				}
			})
		}

		// Delete from server if deleted locally, and if the server has not yet deleted the data.
		const toServerDelete = localTableIds.filter(id => localTableSnapshot[id] && serverTableSnapshot[id] === false)
		for (const id of toServerDelete) {
			syncActions.push({
				type: "version-delete-server",
				detail: {
					databaseId,
					tableKey,
					id: id
				}
			})
		}

		// Delete locally if the server has deleted but local hasn't yet.
		const toLocalDelete = serverTableIds.filter(id => serverTableSnapshot[id] && localTableSnapshot[id] === false)
		for (const id of toLocalDelete) {
			syncActions.push({
				type: "version-delete-local",
				detail: {
					databaseId,
					tableKey,
					id: id
				}
			})
		}

		// Purge locally if the item is already deleted on both the server and locally
		const toPurge = serverTableIds.filter(id => serverTableSnapshot[id] && localTableSnapshot[id])
		for (const id of toPurge) {
			syncActions.push({
				type: "version-purge",
				detail: {
					databaseId,
					tableKey,
					id: id
				}
			})
		}
	}

	return syncActions;
}