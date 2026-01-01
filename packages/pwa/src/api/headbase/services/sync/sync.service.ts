/**
 * - "sync actions" are generated when the user makes changes or changes are received from the server
 * - a "full sync" will compare server and local snapshots and generate the "sync actions" required to sync up
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
import {ErrorIdentifiers, VaultDto} from "@headbase-app/contracts";

import type {SyncAction} from "./sync-actions.ts";
import {EventTypes, type HeadbaseEvent} from "@api/headbase/services/events/events.ts";
import {compareSnapshots} from "./sync-logic.ts";

import {EncryptionService} from "@api/headbase/services/encryption/encryption.service.ts";
import {EventsService} from "@api/headbase/services/events/events.service.ts";
import {ServerService} from "@api/headbase/services/server/server.service.ts";
import {VaultsService} from "@api/vaults/vaults.service.ts";
import {ErrorTypes, HeadbaseError} from "@api/headbase/control-flow.ts";
import {Headbase} from "@api/headbase/headbase.ts";
import type {DeviceService} from "@api/headbase/services/device/device.service.ts";

export type SyncStatus = 'idle' | 'running' | 'error' | 'disabled'


export class SyncService {
	private status: SyncStatus
	private actions: SyncAction[]
	#_handleEventBound: (event: HeadbaseEvent) => Promise<void>

	constructor(
		private hb: Headbase,
		private device: DeviceService,
		private events: EventsService,
		private server: ServerService,
		private vaults: VaultsService,
	) {
		this.status = "idle"
		this.actions = []
		this.#_handleEventBound = this.#handleEvent.bind(this)
	}

	async start() {
		console.debug('[sync] starting sync service');
		this.events.subscribeAll(this.#_handleEventBound)
	}

	async end() {
		console.debug('[sync] ending sync service');
		this.events.unsubscribeAll(this.#_handleEventBound)
	}

	async destroy() {
		await this.end()
	}

	async #handleEvent(event: HeadbaseEvent) {
		console.debug(`[sync] event '${event.type}' received from context '${this.device.getCurrentContext().id}'`)

		if (event.type === EventTypes.OBJECT_CHANGE) {
			if (event.detail.data.action === 'delete') {
				this.actions.push({
					type: 'delete-server',
					detail: {
						vaultId: event.detail.data.vaultId,
						id: event.detail.data.versionId,
					}
				})
			}
			else {
				this.actions.push({
					type: 'upload',
					detail: {
						vaultId: event.detail.data.vaultId,
						id: event.detail.data.versionId,
					}
				})
			}

			this.runActions()
		}
	}

	requestSync() {
		console.debug(`[sync] requesting sync for ${databaseId}`);
		if (this.status !== "running") {
			this.status = 'running'
			this.runSync(databaseId)
				.catch(e => {
					this.status = 'error'
					throw e
				})
				.then(() => {
					this.status = 'idle'
				})
		}
	}

	async #syncDatabase() {
		console.debug(`[sync] starting sync of ''.`)

		const user = await this.server.getCurrentUser()
		if (!user) {
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: "Could not load current user during sync"})
		}

		const localDatabase = await this.vaults.get(databaseId)
		let serverDatabase: VaultDto | null
		try {
			serverDatabase = await this.server.getVault(databaseId);
		}
		catch (error) {
			serverDatabase = null;
			console.debug("[sync] found missing database during sync")
			if (!(error instanceof HeadbaseError) || error?.cause?.originalError?.identifier !== ErrorIdentifiers.VAULT_NOT_FOUND) {
				throw error
			}
		}

		if (!serverDatabase) {
			console.debug(`[sync] creating new database '${localDatabase.id}' during sync`)
			await this.server.createVault({
				ownerId: user.id,
				id: localDatabase.id,
				name: localDatabase.name,
				createdAt: localDatabase.createdAt,
				updatedAt: localDatabase.updatedAt,
				deletedAt: null,
				protectedEncryptionKey: localDatabase.protectedEncryptionKey,
			});
		}
		else if (localDatabase.updatedAt !== serverDatabase.updatedAt) {
			if (localDatabase.updatedAt > serverDatabase.updatedAt) {
				console.debug(`[sync] local base '${localDatabase.id}' is ahead of server, updating now.`)
				await this.server.updateVault(localDatabase.id, {
					name: localDatabase.name,
					protectedEncryptionKey: localDatabase.protectedEncryptionKey,
					protectedData: localDatabase.protectedData,
					updatedAt: localDatabase.updatedAt,
				});
			}
			else {
				console.debug(`[sync] server base '${localDatabase.id}' is ahead of local, updating now.`)
				await this.vaults.update(localDatabase.id, {
					name: serverDatabase.name,
					protectedEncryptionKey: serverDatabase.protectedEncryptionKey,
					protectedData: serverDatabase.protectedData,
					updatedAt: serverDatabase.updatedAt,
				})
			}
		}
	}

	async runSync(baseId: string) {
		console.debug(`[sync] run sync for ${baseId}`);

		let serverSnapshot
		try {
			serverSnapshot = await this.server.getVaultSnapshot(baseId)
		}
		catch (error) {
			if (error instanceof HeadbaseError && error?.cause?.originalError?.identifier === ErrorIdentifiers.VAULT_NOT_FOUND) {
				await this.syncDatabase(baseId)
				serverSnapshot = await this.server.getVaultSnapshot(baseId)
			}
			else {
				throw error
			}
		}
		if (!serverSnapshot) {
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: "Could not fetch server snapshot"})
		}
		const hb = new Headbase(this.events, this.device, {filePath: `/headbase-v1/${baseId}.hb`})

		const localSnapshot = await this.databaseTransactions.snapshot.getSnapshot(baseId)

		console.debug(`[sync] snapshots:`)
		console.debug(localSnapshot)
		console.debug(serverSnapshot)

		const syncActions = compareSnapshots(baseId, localSnapshot.versions, serverSnapshot.versions)
		console.debug(`[sync] sync actions:`)
		console.debug(syncActions)

		this.actions.push(...syncActions)

		// Update lastSynced at timestamp saved to database
		const lastSyncedAt = new Date().toISOString()
		await this.vaults.update(baseId, {
			lastSyncedAt,
		})

		this.runActions()
	}

	async runActions() {
		while (this.actions.length > 0) {
			const action = this.actions.shift()
			if (!action) break;
			try {
				await this.runAction(action)
			}
			catch (e) {
				console.error(e)
			}
		}
	}

	async runAction(action: SyncAction) {
		console.debug(`[sync] running action: ${JSON.stringify(action)}`)

		const encryptionKey = await KeyStorageService.get(action.detail.databaseId)
		if (!encryptionKey) {
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: "Could not fetch encryption key"})
		}

		if (action.type === "upload") {
			const version = await this.databaseTransactions.objectStore.getVersion(action.detail.databaseId, action.detail.id)
			const protectedData = await EncryptionService.encrypt(encryptionKey, version.data)
			await this.server.createVersion({
				spec: version.spec,
				vaultId: action.detail.databaseId,
				type: version.type,
				id: version.id,
				createdAt: version.createdAt,
				createdBy: version.createdBy,
				objectId: version.objectId,
				previousVersionId: version.previousVersionId,
				deletedAt: null,
				protectedData
			})
		}
		else if (action.type === "download") {
			const version = await this.server.getVersion(action.detail.id)
			if (!version.protectedData || version.deletedAt) return;
			const data = await EncryptionService.decrypt(encryptionKey, version.protectedData)

			await this.databaseTransactions.objectStore.createVersion(action.detail.databaseId, {
				spec: version.spec,
				type: version.type,
				id: version.id,
				createdAt: version.createdAt,
				createdBy: version.createdBy,
				objectId: version.objectId,
				previousVersionId: version.previousVersionId,
				data: data
			})
		}
		else if (action.type === "delete-local") {
			await this.databaseTransactions.objectStore.deleteVersion(action.detail.databaseId, action.detail.id)
		}
		else if (action.type === "delete-server") {
			// todo: I don't think server currently cascades all versions?
			await this.server.deleteVersion(action.detail.id)
		}
		else {
			console.error(`[sync] unknown (OR UNIMPLEMENTED) action type found: ${action.type}`)
		}
	}

	async downloadAndSync(vaultId: string) {
		const serverVault = await this.server.getVault(vaultId)
		await this.databasesManagementAPI.insertExisting(serverVault)
		this.requestSync(vaultId)
	}
}
