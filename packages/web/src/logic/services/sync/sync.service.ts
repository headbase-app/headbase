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
import {DeviceContext, IEventsService} from "../interfaces.ts";
import {DatabaseTransactions} from "../database/db.ts";
import {SyncAction} from "./sync-actions.ts";
import {ServerAPI} from "../server/server.ts";
import {HeadbaseEvent} from "../events/events.ts";
import {ErrorTypes, HeadbaseError} from "../../control-flow.ts";
import {ErrorIdentifiers, ItemDto, VaultDto, VersionDto} from "@headbase-app/common";
import {DatabasesManagementAPI} from "../database-management/database-management.ts";
import {compareSnapshots, convertServerSnapshot} from "./sync-logic.ts";
import {KeyStorageService} from "../key-storage/key-storage.service.ts";
import {FieldDto} from "../../schemas/fields/dtos.ts";
import {ContentTypeDto} from "../../schemas/content-types/dtos.ts";
import {ContentItemDto} from "../../schemas/content-items/dtos.ts";
import {ViewDto} from "../../schemas/views/dtos.ts";
import {EncryptionService} from "../encryption/encryption.ts";

export type SyncStatus = 'idle' | 'running' | 'error' | 'disabled'

export interface SyncServiceConfig {
	context: DeviceContext
}

export class SyncService {
	private context: DeviceContext
	private actions: SyncAction[]

	private status: SyncStatus
	_handleEventBound: (event: CustomEvent<HeadbaseEvent>) => Promise<void>

	constructor(
		config: SyncServiceConfig,
		private eventsService: IEventsService,
		private server: ServerAPI,
		private databasesManagementAPI: DatabasesManagementAPI,
		private databaseTransactions: DatabaseTransactions
	) {
		this.context = config.context

		this.status = "idle"
		this.actions = []

		this._handleEventBound = this.handleEvent.bind(this)
	}

	async start() {
		console.debug('[sync] starting sync service');
		this.eventsService.subscribeAll(this._handleEventBound)
	}

	async end() {
		console.debug('[sync] ending sync service');
		this.eventsService.unsubscribeAll(this._handleEventBound)
	}

	async handleEvent(event: CustomEvent<HeadbaseEvent>) {
		console.debug(`[sync] event received from context ${this.context.id}`)
		console.debug(event)
	}

	async destroy() {
		await this.end()
	}

	requestSync(databaseId: string) {
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

	async syncDatabase(databaseId: string) {
		console.debug(`[sync] starting database sync of '${databaseId}'.`)

		const user = await this.server.getCurrentUser()
		if (!user) {
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: "Could not load current user during sync"})
		}

		const localDatabase = await this.databasesManagementAPI.get(databaseId)
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
				console.debug(`[sync] local database  '${localDatabase.id}' is ahead of server, updating now.`)
				await this.server.updateVault(localDatabase.id, {
					name: localDatabase.name,
					protectedEncryptionKey: localDatabase.protectedEncryptionKey,
					protectedData: localDatabase.protectedData,
				});
			}
			else {
				console.debug(`[sync] server database  '${localDatabase.id}' is ahead of local, updating now.`)
				await this.databasesManagementAPI.replace(localDatabase.id, {
					...serverDatabase,
					// todo: is this needed, and if so why is i
					headbaseVersion: localDatabase.headbaseVersion,
					isUnlocked: localDatabase.isUnlocked,
					syncEnabled: localDatabase.syncEnabled,
				})
			}
		}
	}

	private async runSync(databaseId: string) {
		console.debug(`[sync] run sync for ${databaseId}`);

		let serverSnapshot
		try {
			serverSnapshot = await this.server.getVaultSnapshot(databaseId)
		}
		catch (error) {
			if (error instanceof HeadbaseError && error?.cause?.originalError?.identifier === ErrorIdentifiers.VAULT_NOT_FOUND) {
				await this.syncDatabase(databaseId)
				serverSnapshot = await this.server.getVaultSnapshot(databaseId)
			}
			else {
				throw error
			}
		}

		if (!serverSnapshot) {
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: "Could not fetch server snapshot"})
		}

		// todo: call server snapshot something different?
		const serverDataSnapshot = convertServerSnapshot(serverSnapshot)
		const localSnapshot = await this.databaseTransactions.snapshot.getSnapshot(databaseId)
		const syncActions = compareSnapshots(databaseId, localSnapshot, serverDataSnapshot)

		this.actions.push(...syncActions)
		console.debug(syncActions)

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

	private async runAction(action: SyncAction) {
		const encryptionKey = await KeyStorageService.get(action.detail.databaseId)
		if (!encryptionKey) {
			throw new HeadbaseError({type: ErrorTypes.SYSTEM_ERROR, devMessage: "Could not fetch encryption key"})
		}

		if (action.type === "item-upload") {
			let item: FieldDto | ContentTypeDto | ContentItemDto | ViewDto
			if (action.detail.tableKey === "fields") {
				item = await this.databaseTransactions.fields.get(action.detail.databaseId, action.detail.id)
			}
			else if (action.detail.tableKey === "contentTypes") {
				item = await this.databaseTransactions.contentTypes.get(action.detail.databaseId, action.detail.id)
			}
			else if (action.detail.tableKey === "contentItems") {
				item = await this.databaseTransactions.contentItems.get(action.detail.databaseId, action.detail.id)
			}
			else {
				item = await this.databaseTransactions.views.get(action.detail.databaseId, action.detail.id)
			}

			const serverItemDto: ItemDto = {
				vaultId: action.detail.databaseId,
				type: action.detail.tableKey,
				id: item.id,
				createdAt: item.createdAt,
				deletedAt: null
			}

			const protectedData = await EncryptionService.encrypt(encryptionKey, item)
			const serverVersionDto: VersionDto = {
				itemId: item.id,
				id: item.versionId,
				createdAt: item.updatedAt,
				deletedAt: null,
				deviceName: item.versionCreatedBy || "todo",
				protectedData,
			}

			await this.server.createItem(serverItemDto)
			await this.server.createVersion(serverVersionDto)
		}
		else if (action.type === "item-download") {

		}
		else if (action.type === "item-delete-local") {

		}
		else if (action.type === "item-delete-server") {

		}
		else if (action.type === "item-purge") {

		}
		else if (action.type === "version-upload") {

		}
		else if (action.type === "version-download") {

		}
		else if (action.type === "version-delete-local") {

		}
		else if (action.type === "version-delete-server") {

		}
		else if (action.type === "version-purge") {

		}
		else {
			console.error(`[sync] unknown action type found: ${action.type}`)
		}
	}
}
