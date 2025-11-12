import {eq} from "drizzle-orm";
import {z} from "zod";

import {ErrorIdentifiers} from "@headbase-app/contracts";
import type {IEventsService} from "@api/events/events.interface";
import type {IVaultsService} from "@api/vaults/vaults.interface.ts";
import type {IDeviceService} from "@api/device/device.interface";
import {type DatabaseChangeEvent, EventTypes} from "@api/events/events";
import {LiveQueryStatus, type LiveQuerySubscriber, type LiveQuerySubscription} from "@contracts/query";
import {EncryptionService} from "@api/encryption/encryption.service.ts";
import type {KeyValueStoreService} from "@api/key-value-store/key-value-store.service.ts";
import {type CreateVaultDto, LocalVaultDto, type UpdateVaultDto} from "@api/vaults/local-vault.ts";
import {vaults} from "../database/schema.ts"
import {ErrorTypes, HeadbaseError} from "@api/control-flow.ts";
import type {DatabaseService} from "@api/database/database.service.ts";

// todo: move to contracts?
export const VaultsList = z.array(LocalVaultDto)
export type VaultsList = z.infer<typeof VaultsList>


export class VaultsService implements IVaultsService {
	constructor(
		private readonly deviceService: IDeviceService,
		private readonly eventsService: IEventsService,
		private readonly keyValueStoreService: KeyValueStoreService,
		private readonly databaseService: DatabaseService,
	) {}

	/**
	 * Create a new database.
	 *
	 * @param createVaultDto
	 */
	async create(createVaultDto: CreateVaultDto) {
		const db = await this.databaseService.getDatabase()

		const id = EncryptionService.generateUUID();
		const timestamp = new Date().toISOString();
		const {protectedEncryptionKey, encryptionKey} = await EncryptionService.createProtectedEncryptionKey(createVaultDto.password);
		await this.keyValueStoreService.save(id, encryptionKey)

		const newVault: LocalVaultDto = {
			id: id,
			name: createVaultDto.name,
			protectedEncryptionKey: protectedEncryptionKey,
			protectedData: null,
			createdAt: timestamp,
			updatedAt: timestamp,
			deletedAt: null,
		}

		await db
			.insert(vaults)
			// todo: add ownerId if user is logged in?
			.values(newVault)

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: id,
				action: "create"
			}
		})

		return newVault;
	}

	/**
	 * Update the given vault.
	 *
	 * @param id
	 * @param updateVaultDto
	 * @param preventEventDispatch - Prevent an update event being dispatched.
	 */
	async update(id: string, updateVaultDto: UpdateVaultDto, preventEventDispatch?: boolean) {
		const db = await this.databaseService.getDatabase()
		const currentVault = await this.get(id)
		if (!currentVault) {
			throw new Error(ErrorIdentifiers.VAULT_NOT_FOUND)
		}

		const timestamp = new Date().toISOString();
		await db
			.update(vaults)
			.set({
				updatedAt: timestamp,
				name: updateVaultDto.name ?? currentVault.name,
			})
			.where(eq(vaults.id, id))

		if (!preventEventDispatch) {
			this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
				context: this.deviceService.getCurrentContext(),
				data: {
					id: id,
					action: "update"
				}
			})
		}

		return {
			...currentVault,
			name: updateVaultDto.name ?? currentVault.name,
		};
	}

	/**
	 * Delete the given vault.
	 */
	async delete(id: string) {
		// No need to actually access the db, but check it does exist.
		await this.get(id)

		const db = await this.databaseService.getDatabase()
		await db
			.delete(vaults)
			.where(eq(vaults.id, id))

		// todo: also delete file system items

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: id,
				action: "delete"
			}
		})
	}

	async changePassword(id: string, currentPassword: string, newPassword: string) {
		const currentVault = await this.get(id)
		console.debug(id, currentPassword, newPassword)

		const { protectedEncryptionKey } = await EncryptionService.updateProtectedEncryptionKey(
			currentVault.protectedEncryptionKey,
			currentPassword,
			newPassword
		)

		const timestamp = new Date().toISOString();
		const db = await this.databaseService.getDatabase()

		await db
			.update(vaults)
			.set({
				protectedEncryptionKey,
				updatedAt: timestamp
			})
			.where(eq(vaults.id, id))

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: id,
				action: 'change-password',
			}
		})

		return {
			...currentVault,
			protectedEncryptionKey,
			updatedAt: timestamp
		}
	}

	async get(id: string): Promise<LocalVaultDto> {
		const db = await this.databaseService.getDatabase()
		const result = await db.select().from(vaults).where(eq(vaults.id, id))
		if (!result[0]) {
			throw new HeadbaseError({type: ErrorTypes.NOT_FOUND, devMessage: `vault ${id} not found`})
		}
		return result[0];
	}

	async query(): Promise<LocalVaultDto[]> {
		const db = await this.databaseService.getDatabase()
		return db.select().from(vaults);
	}

	liveQuery(subscriber: LiveQuerySubscriber<LocalVaultDto[]>): LiveQuerySubscription {
		const runQuery = async () => {
			subscriber({status: LiveQueryStatus.LOADING})

			try {
				const currentVault = await this.query()
				subscriber({status: LiveQueryStatus.SUCCESS, result: currentVault })
			}
			catch (error) {
				subscriber({status: LiveQueryStatus.ERROR, errors: [error] })
			}
		}

		const handleEvent = async () => {
			runQuery()
		}

		this.eventsService.subscribe(EventTypes.DATABASE_CHANGE, handleEvent)
		runQuery()

		return {
			unsubscribe: () => {
				this.eventsService.unsubscribe(EventTypes.DATABASE_CHANGE, handleEvent)
			}
		}
	}

	liveGet(vaultId: string, subscriber: LiveQuerySubscriber<LocalVaultDto | null>): LiveQuerySubscription {
		const runQuery = async () => {
			subscriber({status: LiveQueryStatus.LOADING})

			try {
				const currentVault = await this.get(vaultId)
				subscriber({status: LiveQueryStatus.SUCCESS, result: currentVault })
			}
			catch (error) {
				subscriber({status: LiveQueryStatus.ERROR, errors: [error] })
			}
		}

		const handleEvent = async (e: DatabaseChangeEvent) => {
			if (e.detail.data.id === vaultId) {
				runQuery()
			}
		}

		this.eventsService.subscribe(EventTypes.DATABASE_CHANGE, handleEvent)
		runQuery()

		return {
			unsubscribe: () => {
				this.eventsService.unsubscribe(EventTypes.DATABASE_CHANGE, handleEvent)
			}
		}
	}
}
