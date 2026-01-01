import {eq} from "drizzle-orm";
import {z} from "zod";

import {ErrorIdentifiers} from "@headbase-app/contracts";
import type {IEventsService} from "@api/headbase/services/events/events.interface.ts";
import type {IVaultsService} from "@api/vaults/vaults.interface.ts";
import type {IDeviceService} from "@api/headbase/services/device/device.interface.ts";
import {type VaultChangeEvent, EventTypes} from "@api/headbase/services/events/events.ts";
import {
	LIVE_QUERY_LOADING_STATE,
	type LiveQueryResult,
	LiveQueryStatus
} from "@api/headbase/control-flow.ts";
import {EncryptionService} from "@api/headbase/services/encryption/encryption.service.ts";
import type {KvStoreService} from "@api/headbase/services/kv-store/kv-store.service.ts";
import {type CreateVaultDto, LocalVaultDto, type UpdateVaultDto} from "@api/vaults/local-vault.ts";
import {ErrorTypes, HeadbaseError} from "@api/headbase/control-flow.ts";
import {SQLocalDrizzle} from "sqlocal/drizzle";
import {featureFlags} from "@/feature-flags.ts";
import {drizzle, type SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {schema, vaults} from "./db/schema.ts";
import migration0 from "./db/migrations/00-setup.sql?raw"
import {Observable} from "rxjs";

// todo: move to contracts?
export const VaultsList = z.array(LocalVaultDto)
export type VaultsList = z.infer<typeof VaultsList>

export class VaultsService implements IVaultsService {
	#db?: SqliteRemoteDatabase<typeof schema>

	constructor(
		private readonly deviceService: IDeviceService,
		private readonly eventsService: IEventsService,
		private readonly keyValueStoreService: KvStoreService,
	) {}

	// todo: extract into separate AppDatabaseService to allow for reuse on different platforms?
	async #getDatabase() {
		if (this.#db) {
			return this.#db;
		}

		const { driver, batchDriver } = new SQLocalDrizzle({
			databasePath: "/headbase-v1/application.sqlite3",
			verbose: featureFlags().debug_sqlite
		});
		this.#db = drizzle(driver, batchDriver, {casing: "snake_case"});
		await this.#db.run(migration0)

		return this.#db
	}

	/**
	 * Create a new database.
	 *
	 * @param createVaultDto
	 */
	async create(createVaultDto: CreateVaultDto) {
		const db = await this.#getDatabase()

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

		this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
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
		const db = await this.#getDatabase()
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
			this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
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

		const db = await this.#getDatabase()
		await db
			.delete(vaults)
			.where(eq(vaults.id, id))

		// todo: also delete file system items

		this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
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
		const db = await this.#getDatabase()

		await db
			.update(vaults)
			.set({
				protectedEncryptionKey,
				updatedAt: timestamp
			})
			.where(eq(vaults.id, id))

		this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
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
		const db = await this.#getDatabase()
		const result = await db.select().from(vaults).where(eq(vaults.id, id))
		if (!result[0]) {
			throw new HeadbaseError({type: ErrorTypes.NOT_FOUND, devMessage: `vault ${id} not found`})
		}
		return result[0];
	}

	async query(): Promise<LocalVaultDto[]> {
		const db = await this.#getDatabase()
		return db.select().from(vaults);
	}

	liveQuery() {
		return new Observable<LiveQueryResult<LocalVaultDto[]>>(observer => {
			observer.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING})

				try {
					const results = await this.query()
					observer.next({status: LiveQueryStatus.SUCCESS, result: results })
				}
				catch (error) {
					observer.next({status: LiveQueryStatus.ERROR, errors: [error] })
				}
			}

			this.eventsService.subscribe(EventTypes.VAULT_CHANGE, runQuery)
			runQuery()

			return {
				unsubscribe: () => {
					this.eventsService.unsubscribe(EventTypes.VAULT_CHANGE, runQuery)
				}
			}
		})
	}

	liveGet(vaultId: string) {
		return new Observable<LiveQueryResult<LocalVaultDto | null>>((observer) => {
			observer.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING})
				try {
					const currentVault = await this.get(vaultId)
					observer.next({status: LiveQueryStatus.SUCCESS, result: currentVault })
				}
				catch (error) {
					observer.next({status: LiveQueryStatus.ERROR, errors: [error] })
				}
			}

			const handleEvent = async (e: VaultChangeEvent) => {
				if (e.detail.data.id === vaultId) {runQuery()}
			}

			this.eventsService.subscribe(EventTypes.VAULT_CHANGE, handleEvent)
			runQuery()

			return {
				unsubscribe: () => {
					this.eventsService.unsubscribe(EventTypes.VAULT_CHANGE, handleEvent)
				}
			}
		})
	}
}
